
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { JobApplication, ApplicationStatus } from './types';

export const useApplications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      
      return { success: true, application: application as JobApplication };
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

  const getMyApplications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fix the join relationship by specifying the correct foreign key
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select(`
          *,
          job:jobs(*)
        `)
        .order('created_at', { ascending: false });
      
      if (applicationsError) throw applicationsError;
      
      // Type assertion with proper transformation
      const typedApplications = applications.map(app => ({
        ...app,
        opportunity_id: app.opportunity_id,
        job: app.job || undefined
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

  const bookmarkJob = async (jobId: string) => {
    return applyForJob(jobId, null, 'bookmarked');
  };

  return {
    applyForJob,
    bookmarkJob,
    getMyApplications,
    isLoading,
    error
  };
};
