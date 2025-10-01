import pool from '../config/db';
import { Comment } from '../models/comment';

export async function createComment(comment: Omit<Comment, 'id' | 'created_at' | 'user_id'>, userId: number): Promise<Comment> {
  const { submission_id, content, line_number } = comment;
  const result = await pool.query(
    'INSERT INTO comments (submission_id, user_id, content, line_number) VALUES ($1, $2, $3, $4) RETURNING *',
    [submission_id, userId, content, line_number]
  );
  return result.rows[0];
}

export async function getComments(submissionId: number, userId: number): Promise<Comment[]> {
  const result = await pool.query(
    'SELECT c.* FROM comments c JOIN submissions s ON c.submission_id = s.id JOIN project_members pm ON s.project_id = pm.project_id WHERE c.submission_id = $1 AND pm.user_id = $2',
    [submissionId, userId]
  );
  return result.rows;
}

export async function updateComment(id: number, content: string, userId: number): Promise<Comment> {
  const result = await pool.query(
    'UPDATE comments c SET content = $1 FROM submissions s JOIN project_members pm ON s.project_id = pm.project_id WHERE c.id = $2 AND c.user_id = $3 AND pm.user_id = $3 RETURNING c.*',
    [content, id, userId]
  );
  if (!result.rows[0]) throw new Error('Comment not found or user not authorized');
  return result.rows[0];
}

export async function deleteComment(id: number, userId: number): Promise<void> {
  const result = await pool.query(
    'DELETE FROM comments c USING submissions s JOIN project_members pm ON s.project_id = pm.project_id WHERE c.id = $1 AND c.user_id = $2 AND pm.user_id = $2',
    [id, userId]
  );
  if (result.rowCount === 0) throw new Error('Comment not found or user not authorized');
}