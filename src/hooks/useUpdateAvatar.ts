
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from './useAuth.types';

export const useUpdateAvatar = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateAvatar = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');

      const bucketName = 'avatars';
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload avatar to storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = await supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { data, error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully."
      });

      return {
        success: true,
        profile: {
          ...data,
          email: user.email
        } as UserProfile
      };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update avatar';
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

  return { updateAvatar, isLoading, error };
};
