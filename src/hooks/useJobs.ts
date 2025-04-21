import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from './useAuth';

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  deadline: string | null;
  created_by: string | null;
  created_at: string;
}

export type ApplicationStatus = 'applied' | 'bookmarked';

export interface JobApplication {
  id: string;
  opportunity_id: string;
  user_id: string;
  status: ApplicationStatus;
  created_at: string;
  resume_id: string | null;
  job?: Job;
}

export const useJobs = () => {
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

  const applyForJob = async (jobId: string, resumeId: string | null = null, status: ApplicationStatus = 'applied') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert({
          opportunity_id: jobId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          status,
          resume_id: resumeId
        })
        .select()
        .single();
      
      if (applicationError) throw applicationError;
      
      toast({
        title: status === 'applied' ? "Application Submitted" : "Job Bookmarked",
        description: status === 'applied' 
          ? "Your application has been submitted successfully." 
          : "Job has been bookmarked for later."
      });
      
      return { success: true, application: application as unknown as JobApplication };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to apply for job';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const bookmarkJob = async (jobId: string) => {
    return applyForJob(jobId, null, 'bookmarked');
  };

  const getMyApplications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select('*, job:jobs(*)')
        .order('created_at', { ascending: false });
      
      if (applicationsError) throw applicationsError;
      
      const typedApplications = applications.map(app => ({
        ...app,
        opportunity_id: app.opportunity_id,
        // Map additional properties for compatibility with the JobApplication interface
      })) as unknown as JobApplication[];
      
      return { applications: typedApplications };
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch applications';
      setError(errorMessage);
      console.error('Error fetching applications:', err);
      return { applications: [] };
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
    applyForJob,
    bookmarkJob,
    getMyApplications,
    createJob,
    updateJob,
    deleteJob,
    isLoading,
    error
  };
};
