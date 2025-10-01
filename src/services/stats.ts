import pool from '../config/db';

export async function getProjectStats(projectId: number, userId: number): Promise<any> {
  const avgReviewTime = await pool.query(
    `SELECT AVG(rh.created_at - s.created_at) as avg_review_time
     FROM submissions s
     JOIN review_history rh ON s.id = rh.submission_id
     JOIN project_members pm ON s.project_id = pm.project_id
     WHERE s.project_id = $1 AND pm.user_id = $2`,
    [projectId, userId]
  );

  const approvalStats = await pool.query(
    `SELECT status, COUNT(*) as count
     FROM submissions s
     JOIN project_members pm ON s.project_id = pm.project_id
     WHERE s.project_id = $1 AND pm.user_id = $2
     GROUP BY status`,
    [projectId, userId]
  );

  const reviewerActivity = await pool.query(
    `SELECT u.name, COUNT(c.id) as comment_count
     FROM comments c
     JOIN submissions s ON c.submission_id = s.id
     JOIN users u ON c.user_id = u.id
     JOIN project_members pm ON s.project_id = pm.project_id
     WHERE s.project_id = $1 AND pm.user_id = $2
     GROUP BY u.name`,
    [projectId, userId]
  );

  const mostCommented = await pool.query(
    `SELECT s.id, COUNT(c.id) as comment_count
     FROM submissions s
     LEFT JOIN comments c ON s.id = c.submission_id
     JOIN project_members pm ON s.project_id = pm.project_id
     WHERE s.project_id = $1 AND pm.user_id = $2
     GROUP BY s.id
     ORDER BY comment_count DESC
     LIMIT 1`,
    [projectId, userId]
  );

  return {
    avg_review_time: avgReviewTime.rows[0]?.avg_review_time || '0',
    approval_stats: approvalStats.rows,
    reviewer_activity: reviewerActivity.rows,
    most_commented: mostCommented.rows[0],
  };
}