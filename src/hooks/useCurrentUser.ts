
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session, UserProfile } from './useAuth.types';

export const useCurrentUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentUser = async (): Promise<{ user: User | null, profile: UserProfile | null }> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { user: null, profile: null };

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, role, avatar_url')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return { user, profile: null };
      }

      return {
        user,
        profile: { ...data, email: user.email } as UserProfile
      };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to get current user';
      setError(errorMessage);
      return { user: null, profile: null };
    } finally {
      setIsLoading(false);
    }
  };

  return { getCurrentUser, isLoading, error };
};
