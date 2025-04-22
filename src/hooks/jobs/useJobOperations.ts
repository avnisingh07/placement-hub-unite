
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Job } from './types';

export const useJobOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getAllJobs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (jobsError) throw jobsError;
      
      return { jobs: jobs as Job[] };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch jobs';
      setError(errorMessage);
      console.error('Error fetching jobs:', err);
      return { jobs: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const getJobById = async (jobId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      
      if (jobError) throw jobError;
      
      return { job: job as Job };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch job';
      setError(errorMessage);
      console.error('Error fetching job:', err);
      return { job: null };
    } finally {
      setIsLoading(false);
    }
  };

  const createJob = async (jobData: Omit<Job, 'id' | 'created_at' | 'created_by'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          created_by: currentUser?.id
        })
        .select()
        .single();
      
      if (jobError) throw jobError;
      
      toast({
        title: "Job Created",
        description: "The job has been created successfully."
      });
      
      return { success: true, job: job as Job };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create job';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Create Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateJob = async (jobId: string, jobData: Partial<Omit<Job, 'id' | 'created_at' | 'created_by'>>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', jobId)
        .select()
        .single();
      
      if (jobError) throw jobError;
      
      toast({
        title: "Job Updated",
        description: "The job has been updated successfully."
      });
      
      return { success: true, job: job as Job };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update job';
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

  const deleteJob = async (jobId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error: jobError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);
      
      if (jobError) throw jobError;
      
      toast({
        title: "Job Deleted",
        description: "The job has been deleted successfully."
      });
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to delete job';
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

  return {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    isLoading,
    error
  };
};
