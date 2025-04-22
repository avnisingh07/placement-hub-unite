
export interface Resume {
  id: string;
  user_id: string;
  title: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  parsed_data: Record<string, any> | null;
  form_data: Record<string, any> | null;
}
