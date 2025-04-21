
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from './useAuth.types';

export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateProfile = async (profileData: Partial<Omit<UserProfile, 'id'>>) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      // Only include fields that exist in the profiles table
      const validProfileData = {
        name: profileData.name,
        role: profileData.role,
        avatar_url: profileData.avatar_url
      };

      const { data, error: profileError } = await supabase
        .from('profiles')
        .update(validProfileData)
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });

      return {
        success: true,
        profile: {
          ...data,
          email: user.email
        } as UserProfile
      };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update profile';
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

  return { updateProfile, isLoading, error };
};
