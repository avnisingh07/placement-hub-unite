import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

import { usersData, channelsData, messagesData, formatTimestamp } from "./chat/chatMockData";
import { ChatSidebar } from "./chat/ChatSidebar";
import ChatArea from "./chat/ChatArea";
import { supabase } from "@/integrations/supabase/client";

const ChatInterface = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState(usersData);
  const [channels, setChannels] = useState(channelsData);
  const [messages, setMessages] = useState(messagesData);
  const [selectedChat, setSelectedChat] = useState("");
  const [chatType, setChatType] = useState<"dm" | "channel">("dm");
  const [inputMessage, setInputMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUsersList, setShowUsersList] = useState(false);

  const currentUserId = typeof user?.id === "string" ? parseInt(user.id, 10) : (user?.id || 0);

  // Get chat info helper (simplified for this refactor)
  const getChatInfo = () => {
    if (!selectedChat) return { title: "", avatar: "", subtitle: "" };
    if (chatType === "dm") {
      const parts = selectedChat.split("_");
      const otherUserId = Number(parts[2]) === currentUserId ? Number(parts[1]) : Number(parts[2]);
      const otherUser = users.find((u) => u.id === otherUserId);
      return {
        title: otherUser?.name || "",
        avatar: otherUser?.avatar || "",
        subtitle: otherUser?.isOnline ? "Online" : "Offline",
        isOnline: otherUser?.isOnline,
      };
    } else {
      const channelId = Number(selectedChat.split("_")[1]);
      const channel = channels.find((c) => c.id === channelId);
      return {
        title: channel?.name || "",
        subtitle: `${channel?.members.length} members`,
        description: channel?.description,
      };
    }
  };

  // Send message
  const sendMessage = () => {
    if (!inputMessage.trim() || !selectedChat) return;
    const newMessage = {
      id: (messages[selectedChat]?.length || 0) + 1,
      senderId: currentUserId,
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages({
      ...messages,
      [selectedChat]: [...(messages[selectedChat] || []), newMessage],
    });
    setInputMessage("");
  };

  // Select chat
  const selectChat = (chatId: string, type: "dm" | "channel") => {
    setSelectedChat(chatId);
    setChatType(type);
    // Mark messages as read
    if (messages[chatId]) {
      const updatedMessages = {
        ...messages,
        [chatId]: messages[chatId].map((msg) => ({
          ...msg,
          isRead: true,
        })),
      };
      setMessages(updatedMessages);
    }
    // Mark channel as read
    if (type === "channel") {
      const channelId = Number(chatId.split("_")[1]);
      setChannels(
        channels.map((channel) =>
          channel.id === channelId ? { ...channel, isUnread: false } : channel
        )
      );
    }
  };

  // Create a new DM chat
  const startDMChat = (userId: number) => {
    const dmId = currentUserId < userId
      ? `dm_${currentUserId}_${userId}`
      : `dm_${userId}_${currentUserId}`;
    if (!messages[dmId]) {
      setMessages({
        ...messages,
        [dmId]: [],
      });
    }
    selectChat(dmId, "dm");
    setShowUsersList(false);
  };

  // Create a new channel
  const createChannel = (name: string, description: string) => {
    if (!name.trim()) return;
    const newId = Math.max(...channels.map((c) => c.id)) + 1;
    const newChannel = {
      id: newId,
      name: name.trim(),
      description: description.trim(),
      members: [currentUserId],
      isUnread: false,
      lastActivity: new Date().toISOString(),
    };
    setChannels([...channels, newChannel]);
    const channelId = `channel_${newChannel.id}`;
    setMessages({
      ...messages,
      [channelId]: [],
    });
    selectChat(channelId, "channel");
  };

  useEffect(() => {
    // Subscribe to real-time updates for new messages
    const channel = supabase
      .channel('chat-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUserId}`
      }, (payload) => {
        // Handle new message
        const newMessage = payload.new;
        setMessages(prevMessages => ({
          ...prevMessages,
          [selectedChat]: [...(prevMessages[selectedChat] || []), newMessage]
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedChat]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col md:flex-row h-full overflow-hidden border rounded-lg">
        <ChatSidebar
          users={users}
          channels={channels}
          messages={messages}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedChat={selectedChat}
          setSelectedChat={selectChat}
          showUsersList={showUsersList}
          setShowUsersList={setShowUsersList}
          startDMChat={startDMChat}
          createChannel={createChannel}
        />
        <ChatArea
          chatType={chatType}
          selectedChat={selectedChat}
          chatInfo={getChatInfo()}
          users={users}
          messages={messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSend={sendMessage}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
