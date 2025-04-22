
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
