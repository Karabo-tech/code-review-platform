export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  picture?: string;
  role: 'Reviewer' | 'Submitter';
}