
import { useState } from 'react';
import { useJobOperations } from './useJobOperations';
import { useApplications } from './useApplications';
import type { Job, JobApplication } from './types';

export const useJobs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob
  } = useJobOperations();
  
  const {
    applyForJob,
    bookmarkJob,
    getMyApplications
  } = useApplications();

  return {
    getAllJobs,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
    applyForJob,
    bookmarkJob,
    getMyApplications,
    isLoading,
    error
  };
};

export type { Job, JobApplication };
