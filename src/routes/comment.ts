import { Router, Request, Response } from 'express';
import { createComment, getComments, updateComment, deleteComment } from '../services/comment';
import { authenticateToken, restrictTo } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';

const router = Router();

router.post(
  '/:id/comments',
  authenticateToken,
  restrictTo('Reviewer'),
  [param('id').isInt(), body('content').notEmpty(), body('line_number').optional().isInt()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const comment = await createComment({ submission_id: parseInt(req.params.id), ...req.body }, req.user!.id);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

router.get('/:id/comments', authenticateToken, async (req: Request, res: Response) => {
  try {
    const comments = await getComments(parseInt(req.params.id), req.user!.id);
    res.json(comments);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.put(
  '/:id',
  authenticateToken,
  [param('id').isInt(), body('content').notEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const comment = await updateComment(parseInt(req.params.id), req.body.content, req.user!.id);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    await deleteComment(parseInt(req.params.id), req.user!.id);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;