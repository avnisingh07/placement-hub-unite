
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useResumeStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const bucketName = 'resumes';

  const ensureBucketExists = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === bucketName)) {
        console.log(`Bucket '${bucketName}' doesn't exist - user needs admin to create it`);
      }
    } catch (err) {
      console.error('Error checking bucket:', err);
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

  const deleteResumeFile = async (filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete resume file';
      console.error('Error deleting resume file:', err);
      return { success: false, error: errorMessage };
    }
  };

  return {
    ensureBucketExists,
    getResumeFileUrl,
    deleteResumeFile,
    isLoading,
    error
  };
};
