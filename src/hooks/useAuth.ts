
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Session, Provider } from '@supabase/supabase-js';

export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email?: string; // Make email optional to match database schema
  avatar_url?: string | null;
  preferences?: Record<string, any> | null;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw authError;
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to login';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole = 'student') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
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

  const signInWithProvider = async (provider: Provider) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
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
  
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to logout';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = async (): Promise<{ user: User | null, profile: UserProfile | null }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { user: null, profile: null };
      }
      
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, role, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return { user, profile: null };
      }
      
      // Safe type assertion since we've checked for errors
      return { 
        user, 
        profile: data as UserProfile
      };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to get current user';
      setError(errorMessage);
      console.error('Error getting current user:', err);
      return { user: null, profile: null };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password
      });
      
      if (updateError) throw updateError;
      
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

  return {
    login,
    register,
    signInWithProvider,
    logout,
    getCurrentUser,
    updatePassword,
    isLoading,
    error
  };
};
