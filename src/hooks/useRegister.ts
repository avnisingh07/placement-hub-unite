
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/hooks/useAuth';

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const register = async (
    email: string,
    password: string,
    name: string,
    role: UserRole = 'student'
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } }
      });
      if (authError) throw authError;
      toast({
        title: "Registration Successful",
        description: "Please check your email to confirm your account."
      });
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to register';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
};
