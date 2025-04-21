
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  receivers: string[] | null;
  read_by: string[] | null;
  created_at: string;
}

export const useNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return { notifications: [] };
      
      const { data: notificationData, error: notificationError } = await supabase
        .from('notifications')
        .select('*')
        .or(`receivers.is.null,receivers.cs.{${user.id}}`)
        .order('created_at', { ascending: false });
      
      if (notificationError) throw notificationError;
      
      const notifications = notificationData as Notification[];
      
      // Calculate unread count
      const unread = notifications.filter(notification => {
        return !notification.read_by || !notification.read_by.includes(user.id);
      }).length;
      
      setNotifications(notifications);
      setUnreadCount(unread);
      
      return { notifications };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', err);
      return { notifications: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      // Get current notification
      const { data: notification, error: getError } = await supabase
        .from('notifications')
        .select('read_by')
        .eq('id', notificationId)
        .single();
      
      if (getError) throw getError;
      
      // Update read_by array
      const readBy = notification.read_by || [];
      if (!readBy.includes(user.id)) {
        readBy.push(user.id);
      }
      
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read_by: readBy })
        .eq('id', notificationId);
      
      if (updateError) throw updateError;
      
      // Update local state
      await fetchNotifications();
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to mark notification as read';
      setError(errorMessage);
      console.error('Error marking notification as read:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const markAsUnread = async (notificationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      // Get current notification
      const { data: notification, error: getError } = await supabase
        .from('notifications')
        .select('read_by')
        .eq('id', notificationId)
        .single();
      
      if (getError) throw getError;
      
      // Update read_by array
      let readBy = notification.read_by || [];
      readBy = readBy.filter(id => id !== user.id);
      
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read_by: readBy })
        .eq('id', notificationId);
      
      if (updateError) throw updateError;
      
      // Update local state
      await fetchNotifications();
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to mark notification as unread';
      setError(errorMessage);
      console.error('Error marking notification as unread:', err);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      // Update each notification
      for (const notification of notifications) {
        const readBy = notification.read_by || [];
        if (!readBy.includes(user.id)) {
          readBy.push(user.id);
          await supabase
            .from('notifications')
            .update({ read_by: readBy })
            .eq('id', notification.id);
        }
      }
      
      // Update local state
      await fetchNotifications();
      
      toast({
        title: "Notifications Read",
        description: "All notifications have been marked as read."
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to mark all notifications as read';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Admin function to create a notification
  const createNotification = async (title: string, body: string, type: string, receivers: string[] | null = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: createError } = await supabase
        .from('notifications')
        .insert({ title, body, type, receivers })
        .select()
        .single();
      
      if (createError) throw createError;
      
      toast({
        title: "Notification Created",
        description: "Your notification has been created successfully."
      });
      
      // Update local state
      await fetchNotifications();
      
      return { success: true, notification: data as Notification };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create notification';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications' 
      }, () => {
        fetchNotifications();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    createNotification,
    isLoading,
    error
  };
};
