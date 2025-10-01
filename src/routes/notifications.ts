import { Router, Request, Response } from 'express';
import { getNotifications } from '../services/notification';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/:id/notifications', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (parseInt(req.params.id) !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const notifications = await getNotifications(req.user!.id);
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;