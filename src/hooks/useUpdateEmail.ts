
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUpdateEmail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateEmail = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error: emailError } = await supabase.auth.updateUser({
        email
      });

      if (emailError) throw emailError;

      toast({
        title: "Email Update Initiated",
        description: "Please check your new email to confirm the update."
      });

      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update email';
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

  return { updateEmail, isLoading, error };
};
