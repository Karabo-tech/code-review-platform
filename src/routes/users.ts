import { Router, Request, Response } from 'express';
import pool from '../config/db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  if (!req.user || req.user.id !== userId) return res.status(403).json({ error: 'Forbidden' });

  const result = await pool.query('SELECT id, email, name, picture, role FROM users WHERE id = $1', [userId]);
  if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json(result.rows[0]);
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  if (!req.user || req.user.id !== userId) return res.status(403).json({ error: 'Forbidden' });

  const { name, picture } = req.body;
  const result = await pool.query(
    'UPDATE users SET name = $1, picture = $2 WHERE id = $3 RETURNING id, email, name, picture, role',
    [name, picture, userId]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json(result.rows[0]);
});

export default router;