
export interface Job {
  id: string;
  title: string;
  company: string;
  description: string | null;
  skills: string[] | null;
  deadline: string | null;
  created_by: string | null;
  created_at: string;
}

export type ApplicationStatus = 'applied' | 'bookmarked' | 'pending' | 'accepted' | 'rejected';

export interface JobApplication {
  id: string;
  opportunity_id: string;
  user_id: string;
  resume_id: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  job?: Job;
}
