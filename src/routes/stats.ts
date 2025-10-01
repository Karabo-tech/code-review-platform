import { Router, Request, Response } from 'express';
import { getProjectStats } from '../services/stats';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/:id/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const stats = await getProjectStats(parseInt(req.params.id), req.user!.id);
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;