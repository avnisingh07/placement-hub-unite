
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from './useAuth';

export interface Reminder {
  id: string;
  title: string;
  message: string;
  due_date: string;
  created_by: string | null;
  target: string[] | null;
  created_at: string;
}

export const useReminders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const { toast } = useToast();

  const fetchReminders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return { reminders: [] };
      
      const { data: reminderData, error: reminderError } = await supabase
        .from('reminders')
        .select('*')
        .or(`target.is.null,target.cs.{${user.id}}`)
        .order('due_date', { ascending: true });
      
      if (reminderError) throw reminderError;
      
      const reminders = reminderData as Reminder[];
      setReminders(reminders);
      
      return { reminders };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch reminders';
      setError(errorMessage);
      console.error('Error fetching reminders:', err);
      return { reminders: [] };
    } finally {
      setIsLoading(false);
    }
  };

  // Admin function to create a reminder
  const createReminder = async (title: string, message: string, dueDate: string, target: string[] | null = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const { data, error: createError } = await supabase
        .from('reminders')
        .insert({
          title,
          message,
          due_date: dueDate,
          created_by: user.id,
          target
        })
        .select()
        .single();
      
      if (createError) throw createError;
      
      toast({
        title: "Reminder Created",
        description: "Your reminder has been created successfully."
      });
      
      // Update local state
      await fetchReminders();
      
      return { success: true, reminder: data as Reminder };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create reminder';
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

  // Admin function to update a reminder
  const updateReminder = async (reminderId: string, reminderData: Partial<Omit<Reminder, 'id' | 'created_at' | 'created_by'>>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: updateError } = await supabase
        .from('reminders')
        .update(reminderData)
        .eq('id', reminderId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      toast({
        title: "Reminder Updated",
        description: "Your reminder has been updated successfully."
      });
      
      // Update local state
      await fetchReminders();
      
      return { success: true, reminder: data as Reminder };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update reminder';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Admin function to delete a reminder
  const deleteReminder = async (reminderId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);
      
      if (deleteError) throw deleteError;
      
      toast({
        title: "Reminder Deleted",
        description: "Your reminder has been deleted successfully."
      });
      
      // Update local state
      await fetchReminders();
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete reminder';
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
    fetchReminders();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:reminders')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'reminders' 
      }, () => {
        fetchReminders();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    reminders,
    fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder,
    isLoading,
    error
  };
};
