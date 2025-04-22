
export * from './types';
export * from './useJobOperations';
export * from './useApplications';

// Re-export combined hook for backward compatibility
import { useJobOperations } from './useJobOperations';
import { useApplications } from './useApplications';

export const useJobs = () => {
  const jobOps = useJobOperations();
  const applicationOps = useApplications();

  return {
    ...jobOps,
    ...applicationOps
  };
};
