
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Resume } from './types';

export const useResumeOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getMyResumes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: resumes, error: resumesError } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (resumesError) throw resumesError;
      
      return { resumes: resumes as Resume[] };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch resumes';
      setError(errorMessage);
      console.error('Error fetching resumes:', err);
      return { resumes: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const getResumeById = async (resumeId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();
      
      if (resumeError) throw resumeError;
      
      return { resume: resume as Resume };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch resume';
      setError(errorMessage);
      console.error('Error fetching resume:', err);
      return { resume: null };
    } finally {
      setIsLoading(false);
    }
  };

  const updateResumeData = async (resumeId: string, parsedData?: Record<string, any>, formData?: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updateData: Partial<Resume> = {};
      if (parsedData) updateData.parsed_data = parsedData;
      if (formData) updateData.form_data = formData;
      
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .update(updateData)
        .eq('id', resumeId)
        .select()
        .single();
      
      if (resumeError) throw resumeError;
      
      toast({
        title: "Resume Updated",
        description: "Your resume data has been updated successfully."
      });
      
      return { success: true, resume: resume as Resume };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update resume data';
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
    getMyResumes,
    getResumeById,
    updateResumeData,
    isLoading,
    error
  };
};
