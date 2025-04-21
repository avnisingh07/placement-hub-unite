
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from './useAuth';

export const useSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const { data, error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (profileError) throw profileError;
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
      
      return { success: true, profile: data as UserProfile };
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

  const updatePassword = async (password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: passwordError } = await supabase.auth.updateUser({
        password
      });
      
      if (passwordError) throw passwordError;
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully."
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update password';
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
      
      return { success: true, profile: data as UserProfile };
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

  const updatePreferences = async (preferences: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const { data, error: prefError } = await supabase
        .from('profiles')
        .update({ preferences })
        .eq('id', user.id)
        .select()
        .single();
      
      if (prefError) throw prefError;
      
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been updated successfully."
      });
      
      return { success: true, profile: data as UserProfile };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update preferences';
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
  
  return {
    updateProfile,
    updatePassword,
    updateEmail,
    updateAvatar,
    updatePreferences,
    isLoading,
    error
  };
};
