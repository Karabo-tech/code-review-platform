import pool from '../config/db';

export async function createNotification(userId: number, type: string, message: string): Promise<void> {
  await pool.query('INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3)', [userId, type, message]);
}

export async function getNotifications(userId: number): Promise<any[]> {
  const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return result.rows;
}