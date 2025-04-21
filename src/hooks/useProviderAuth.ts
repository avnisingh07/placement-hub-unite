
import { useState } from 'react';
import { Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useProviderAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const signInWithProvider = async (provider: Provider) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/dashboard` }
      });
      if (authError) throw authError;
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || `Failed to sign in with ${provider}`;
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithProvider, isLoading, error };
};
