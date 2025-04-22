
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useResumeOperations } from './useResumeOperations';
import { useResumeStorage } from './useResumeStorage';
import { supabase } from '@/integrations/supabase/client';
import type { Resume } from './types';

export const useResumes = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const {
    getMyResumes,
    getResumeById,
    updateResumeData,
    isLoading: operationsLoading,
    error: operationsError
  } = useResumeOperations();

  const {
    ensureBucketExists,
    getResumeFileUrl,
    deleteResumeFile,
    isLoading: storageLoading,
    error: storageError
  } = useResumeStorage();

  const isLoading = operationsLoading || storageLoading;
  const error = operationsError || storageError;

  const uploadResume = async (file: File, title: string, parsedData?: Record<string, any>, formData?: Record<string, any>) => {
    setUploadProgress(0);
    
    try {
      await ensureBucketExists();
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const userId = user.id;
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .insert({
          user_id: userId,
          title,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          parsed_data: parsedData || null,
          form_data: formData || null
        })
        .select()
        .single();
      
      if (resumeError) {
        await deleteResumeFile(filePath);
        throw resumeError;
      }
      
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully."
      });
      
      return { success: true, resume: resume as Resume };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to upload resume';
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const deleteResume = async (resumeId: string) => {
    try {
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('file_path')
        .eq('id', resumeId)
        .single();
      
      if (resumeError) throw resumeError;
      
      if (resume.file_path) {
        await deleteResumeFile(resume.file_path);
      }
      
      const { error: deleteError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);
      
      if (deleteError) throw deleteError;
      
      toast({
        title: "Resume Deleted",
        description: "Your resume has been deleted successfully."
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete resume';
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  return {
    getMyResumes,
    getResumeById,
    uploadResume,
    updateResumeData,
    deleteResume,
    getResumeFileUrl,
    isLoading,
    uploadProgress,
    error
  };
};

export type { Resume };
