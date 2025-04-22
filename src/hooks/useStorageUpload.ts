
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UploadOptions {
  bucket: string;
  path?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export const useStorageUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File, 
    { bucket, path = '', cacheControl = '3600', upsert = false }: UploadOptions
  ) => {
    if (!file) {
      setError('No file selected');
      return { data: null, error: 'No file selected' };
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);

    try {
      // Create file path with optional sub-path and unique timestamp
      const filePath = path 
        ? `${path}/${Date.now()}_${file.name}`
        : `${Date.now()}_${file.name}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl,
          upsert
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL for the file
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      setProgress(100);
      return { data: { ...data, publicUrl }, error: null };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to upload file';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadFile, isLoading, progress, error };
};
