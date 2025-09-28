import pool from '../config/db';
import { Project } from '../models/project';

export async function createProject(project: Omit<Project, 'id' | 'created_at'>, userId: number): Promise<Project> {
  const { name, description } = project;
  const result = await pool.query(
    'INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
    [name, description, userId]
  );
  return result.rows[0];
}

export async function getProjects(userId: number): Promise<Project[]> {
  const result = await pool.query(
    'SELECT p.* FROM projects p JOIN project_members pm ON p.id = pm.project_id WHERE pm.user_id = $1',
    [userId]
  );
  return result.rows;
}

export async function addMember(projectId: number, userId: number, role: string, createdBy: number): Promise<void> {
  const project = await pool.query('SELECT created_by FROM projects WHERE id = $1', [projectId]);
  if (!project.rows[0] || project.rows[0].created_by !== createdBy) {
    throw new Error('Forbidden');
  }
  await pool.query('INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)', [
    projectId,
    userId,
    role,
  ]);
}

export async function removeMember(projectId: number, userId: number, createdBy: number): Promise<void> {
  const project = await pool.query('SELECT created_by FROM projects WHERE id = $1', [projectId]);
  if (!project.rows[0] || project.rows[0].created_by !== createdBy) {
    throw new Error('Forbidden');
  }
  await pool.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [projectId, userId]);
}