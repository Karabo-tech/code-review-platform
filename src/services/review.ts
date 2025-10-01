import pool from '../config/db';
import { Submission } from '../models/submission';

export async function approveSubmission(id: number, userId: number): Promise<Submission> {
  const result = await pool.query(
    'UPDATE submissions s SET status = $1 FROM project_members pm WHERE s.id = $2 AND pm.project_id = s.project_id AND pm.user_id = $3 AND pm.role = $4 RETURNING s.*',
    ['approved', id, userId, 'Reviewer']
  );
  if (!result.rows[0]) throw new Error('Submission not found or user not authorized');
  await pool.query('INSERT INTO review_history (submission_id, user_id, status) VALUES ($1, $2, $3)', [
    id,
    userId,
    'approved',
  ]);
  return result.rows[0];
}

export async function requestChanges(id: number, userId: number): Promise<Submission> {
  const result = await pool.query(
    'UPDATE submissions s SET status = $1 FROM project_members pm WHERE s.id = $2 AND pm.project_id = s.project_id AND pm.user_id = $3 AND pm.role = $4 RETURNING s.*',
    ['changes_requested', id, userId, 'Reviewer']
  );
  if (!result.rows[0]) throw new Error('Submission not found or user not authorized');
  await pool.query('INSERT INTO review_history (submission_id, user_id, status) VALUES ($1, $2, $3)', [
    id,
    userId,
    'changes_requested',
  ]);
  return result.rows[0];
}

export async function getReviewHistory(id: number, userId: number): Promise<any[]> {
  const result = await pool.query(
    'SELECT rh.* FROM review_history rh JOIN submissions s ON rh.submission_id = s.id JOIN project_members pm ON s.project_id = pm.project_id WHERE rh.submission_id = $1 AND pm.user_id = $2',
    [id, userId]
  );
  return result.rows;
}