import { Router, Request, Response } from 'express';
import { createSubmission, getSubmissionsByProject, getSubmission, updateSubmissionStatus, deleteSubmission } from '../services/submission';
import { authenticateToken, restrictTo } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';
import { approveSubmission, requestChanges, getReviewHistory } from '../services/review';


const router = Router();

router.post(
  '/',
  authenticateToken,
  [body('project_id').isInt(), body('content').notEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const submission = await createSubmission(req.body, req.user.id);
      res.status(201).json(submission);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

router.get('/:projectId/submissions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const submissions = await getSubmissionsByProject(parseInt(req.params.projectId), req.user!.id);
    res.json(submissions);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const submission = await getSubmission(parseInt(req.params.id), req.user!.id);
    res.json(submission);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
});

router.patch(
  '/:id/status',
  authenticateToken,
  restrictTo('Reviewer'),
  [param('id').isInt(), body('status').isIn(['pending', 'in_review', 'approved', 'changes_requested'])],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const submission = await updateSubmissionStatus(parseInt(req.params.id), req.body.status, req.user!.id);
      res.json(submission);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    await deleteSubmission(parseInt(req.params.id), req.user!.id);
    res.json({ message: 'Submission deleted' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/:id/approve', authenticateToken, restrictTo('Reviewer'), async (req: Request, res: Response) => {
  try {
    const submission = await approveSubmission(parseInt(req.params.id), req.user!.id);
    res.json(submission);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/:id/request-changes', authenticateToken, restrictTo('Reviewer'), async (req: Request, res: Response) => {
  try {
    const submission = await requestChanges(parseInt(req.params.id), req.user!.id);
    res.json(submission);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get('/:id/reviews', authenticateToken, async (req: Request, res: Response) => {
  try {
    const history = await getReviewHistory(parseInt(req.params.id), req.user!.id);
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;