import pool from '../config/db';
import { Submission } from '../models/submission';
import { broadcastNotification } from '../services/websocket';
import { createNotification } from '../services/notification';

export async function createSubmission(submission: Omit<Submission, 'id' | 'created_at' | 'status'>, userId: number): Promise<Submission> {
  const result = await pool.query(
    'INSERT INTO submissions (project_id, content, status, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
    [submission.project_id, submission.content, 'pending', userId]
  );
  const newSubmission = result.rows[0];
  const members = await pool.query('SELECT user_id FROM project_members WHERE project_id = $1', [submission.project_id]);
  members.rows.forEach(async (member: any) => {
    await createNotification(member.user_id, 'new_submission', `New submission in project ${submission.project_id}`);
    broadcastNotification(member.user_id, 'new_submission', `New submission in project ${submission.project_id}`);
  });
  return newSubmission;
}

export async function getSubmissionsByProject(projectId: number, userId: number): Promise<Submission[]> {
  const result = await pool.query(
    'SELECT s.* FROM submissions s JOIN project_members pm ON s.project_id = pm.project_id WHERE s.project_id = $1 AND pm.user_id = $2',
    [projectId, userId]
  );
  return result.rows;
}

export async function getSubmission(id: number, userId: number): Promise<Submission> {
  const result = await pool.query(
    'SELECT s.* FROM submissions s JOIN project_members pm ON s.project_id = pm.project_id WHERE s.id = $1 AND pm.user_id = $2',
    [id, userId]
  );
  if (!result.rows[0]) throw new Error('Submission not found');
  return result.rows[0];
}

export async function updateSubmissionStatus(id: number, status: string, userId: number): Promise<Submission> {
  const result = await pool.query(
    'UPDATE submissions s SET status = $1 FROM project_members pm WHERE s.id = $2 AND pm.project_id = s.project_id AND pm.user_id = $3 AND pm.role = $4 RETURNING s.*',
    [status, id, userId, 'Reviewer']
  );
  if (!result.rows[0]) throw new Error('Submission not found or user not authorized');
  return result.rows[0];
}

export async function deleteSubmission(id: number, userId: number): Promise<void> {
  const result = await pool.query(
    'DELETE FROM submissions s USING project_members pm WHERE s.id = $1 AND s.project_id = pm.project_id AND pm.user_id = $2 AND s.created_by = $2',
    [id, userId]
  );
  if (result.rowCount === 0) throw new Error('Submission not found or user not authorized');
}

