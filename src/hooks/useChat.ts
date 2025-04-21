
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    name: string;
    avatar_url?: string | null;
  };
  receiver?: {
    name: string;
    avatar_url?: string | null;
  };
}

export interface Conversation {
  contact: {
    id: string;
    name: string;
    avatar_url?: string | null;
  };
  lastMessage: Message;
  unreadCount: number;
}

export const useChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return { conversations: [] };
      
      // Get all messages for this user (sent or received)
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select(`
          id, sender_id, receiver_id, content, is_read, created_at,
          sender:profiles!sender_id(name, avatar_url),
          receiver:profiles!receiver_id(name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (messageError) throw messageError;
      
      // Group messages by conversation partner
      const conversationMap = new Map<string, Conversation>();
      
      messageData.forEach((message: any) => {
        const isUserSender = message.sender_id === user.id;
        const contactId = isUserSender ? message.receiver_id : message.sender_id;
        const contact = isUserSender ? message.receiver : message.sender;
        
        if (!conversationMap.has(contactId)) {
          conversationMap.set(contactId, {
            contact: {
              id: contactId,
              name: contact.name,
              avatar_url: contact.avatar_url
            },
            lastMessage: message,
            unreadCount: (!isUserSender && !message.is_read) ? 1 : 0
          });
        } else if (!isUserSender && !message.is_read) {
          // Increment unread count for existing conversation
          const convo = conversationMap.get(contactId)!;
          convo.unreadCount += 1;
          conversationMap.set(contactId, convo);
        }
      });
      
      const sortedConversations = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime());
      
      setConversations(sortedConversations);
      
      return { conversations: sortedConversations };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch conversations';
      setError(errorMessage);
      console.error('Error fetching conversations:', err);
      return { conversations: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return { messages: [] };
      
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select(`
          id, sender_id, receiver_id, content, is_read, created_at,
          sender:profiles!sender_id(name, avatar_url),
          receiver:profiles!receiver_id(name, avatar_url)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (messageError) throw messageError;
      
      setMessages(messageData);
      setCurrentChat(contactId);
      
      // Mark messages as read
      const unreadMessageIds = messageData
        .filter((msg: Message) => msg.receiver_id === user.id && !msg.is_read)
        .map((msg: Message) => msg.id);
      
      if (unreadMessageIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessageIds);
        
        // Update conversation unread counts
        fetchConversations();
      }
      
      return { messages: messageData };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch messages';
      setError(errorMessage);
      console.error('Error fetching messages:', err);
      return { messages: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          is_read: false
        })
        .select()
        .single();
      
      if (sendError) throw sendError;
      
      // If we're in the same conversation, update the messages view
      if (currentChat === receiverId) {
        fetchMessages(receiverId);
      }
      
      // Update conversations list
      fetchConversations();
      
      return { success: true, message: data as Message };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to send message';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Send Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);
      
      if (deleteError) throw deleteError;
      
      // Update messages if in a conversation
      if (currentChat) {
        fetchMessages(currentChat);
      }
      
      // Update conversations list
      fetchConversations();
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete message';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Subscribe to realtime changes for messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages' 
      }, async (payload) => {
        // Update messages if in a conversation
        if (currentChat) {
          const user = (await supabase.auth.getUser()).data.user;
          const newMessage = payload.new as Message;
          
          // If this message is part of the current conversation
          if (
            (newMessage.sender_id === currentChat && newMessage.receiver_id === user?.id) ||
            (newMessage.sender_id === user?.id && newMessage.receiver_id === currentChat)
          ) {
            fetchMessages(currentChat);
          }
        }
        
        // Always update conversations
        fetchConversations();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentChat]);

  return {
    conversations,
    messages,
    currentChat,
    fetchConversations,
    fetchMessages,
    sendMessage,
    deleteMessage,
    setCurrentChat,
    isLoading,
    error
  };
};
