export interface Submission {
  id: number;
  project_id: number;
  content: string;
  status: 'pending' | 'in_review' | 'approved' | 'changes_requested';
  created_by: number;
  created_at: Date;
}