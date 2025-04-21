import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  parsed_data: Record<string, any> | null;
  form_data: Record<string, any> | null;
}

export const useResumes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const bucketName = 'resumes';

  // Ensure the bucket exists
  const ensureBucketExists = async () => {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === bucketName)) {
        console.log(`Bucket '${bucketName}' doesn't exist - user needs admin to create it`);
      }
    } catch (err) {
      console.error('Error checking bucket:', err);
    }
  };

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

  const uploadResume = async (file: File, title: string, parsedData?: Record<string, any>, formData?: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      await ensureBucketExists();
      
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('User not authenticated');
      
      const userId = user.id;
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) throw uploadError;
      
      // Create resume record in database
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
        // Clean up storage if database insert fails
        await supabase.storage.from(bucketName).remove([filePath]);
        throw resumeError;
      }
      
      toast({
        title: "Resume Uploaded",
        description: "Your resume has been uploaded successfully."
      });
      
      return { success: true, resume: resume as Resume };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to upload resume';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
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

  const deleteResume = async (resumeId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get resume details first to get file path
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .select('file_path')
        .eq('id', resumeId)
        .single();
      
      if (resumeError) throw resumeError;
      
      // Delete file from storage
      if (resume.file_path) {
        const { error: storageError } = await supabase.storage
          .from(bucketName)
          .remove([resume.file_path]);
        
        if (storageError) console.error('Error deleting file from storage:', storageError);
      }
      
      // Delete record from database
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
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const getResumeFileUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60); // URL valid for 1 hour
      
      if (error) throw error;
      
      return data.signedUrl;
    } catch (err) {
      console.error('Error getting resume file URL:', err);
      return null;
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
