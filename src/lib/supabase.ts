import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Resume = {
  id: string;
  user_id: string;
  title: string;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type Consultation = {
  id: string;
  user_id: string;
  topic: string;
  messages: Array<{ role: string; content: string }>;
  status: string;
  created_at: string;
  updated_at: string;
};

export type InterviewSession = {
  id: string;
  user_id: string;
  job_role: string;
  questions: Array<string>;
  responses: Array<{ question: string; answer: string }>;
  feedback: string | null;
  score: number | null;
  created_at: string;
  completed_at: string | null;
};

export type Assessment = {
  id: string;
  user_id: string;
  assessment_type: string;
  questions: Array<unknown>;
  answers: Array<unknown>;
  results: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
};

export type CareerPath = {
  id: string;
  user_id: string;
  current_position: string;
  target_role: string;
  roadmap: Array<unknown>;
  progress: number;
  created_at: string;
  updated_at: string;
};
