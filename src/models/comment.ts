export interface Comment {
  id: number;
  submission_id: number;
  user_id: number;
  content: string;
  line_number?: number;
  created_at: Date;
}