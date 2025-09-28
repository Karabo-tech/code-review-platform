import { Router, Request, Response } from 'express';
import { createProject, getProjects, addMember, removeMember } from '../services/project';
import { authenticateToken, restrictTo } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';

const router = Router();

router.post(
  '/',
  authenticateToken,
  [body('name').notEmpty(), body('description').optional()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const project = await createProject(req.body, req.user!.id);
      await addMember(project.id, req.user!.id, req.user!.role, req.user!.id);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  const projects = await getProjects(req.user!.id);
  res.json(projects);
});

router.post(
  '/:id/members',
  authenticateToken,
  [param('id').isInt(), body('userId').isInt(), body('role').isIn(['Reviewer', 'Submitter'])],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      await addMember(parseInt(req.params.id), req.body.userId, req.body.role, req.user!.id);
      res.status(201).json({ message: 'Member added' });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

router.delete('/:id/members/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    await removeMember(parseInt(req.params.id), parseInt(req.params.userId), req.user!.id);
    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;