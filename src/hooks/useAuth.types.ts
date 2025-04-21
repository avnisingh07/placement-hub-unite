
import { User, Session, Provider } from '@supabase/supabase-js';

export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  avatar_url?: string | null;
  preferences?: Record<string, any> | null;
}

export type { User, Session, Provider };
