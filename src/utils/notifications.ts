import pool from '../config/db';
//import { broadcastNotification } from '../services/websocket';

export interface Notification {
  id?: number;
  user_id: number;
  type: string;
  message: string;
  read?: boolean;
  created_at?: Date;
}

// Create a notification and broadcast it via WebSocket
export async function createAndBroadcastNotification(
  userId: number,
  type: string,
  message: string,
  relatedId?: number // Optional ID for submission or comment
): Promise<void> {
  try {
    // Store notification in the database
    await pool.query(
      'INSERT INTO notifications (user_id, type, message, read) VALUES ($1, $2, $3, $4)',
      [userId, type, message, false]
    );

    // Broadcast to WebSocket clients
    broadcastNotification(userId, type, message);
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

// Utility to notify all project members (e.g., for new submissions)
export async function notifyProjectMembers(
  projectId: number,
  type: string,
  message: string,
  excludeUserId?: number // Optional: exclude the user who triggered the action
): Promise<void> {
  try {
    const members = await pool.query(
      'SELECT user_id FROM project_members WHERE project_id = $1',
      [projectId]
    );

    for (const member of members.rows) {
      if (excludeUserId && member.user_id === excludeUserId) continue;
      await createAndBroadcastNotification(member.user_id, type, message);
    }
  } catch (error) {
    console.error('Error notifying project members:', error);
    throw new Error('Failed to notify project members');
  }
}

export async function createNotification(userId: number, type: string, message: string): Promise<void> {
  // Placeholder implementation
  return;
}

export function broadcastNotification(userId: number, type: string, message: string) {
  // implementation details
}
