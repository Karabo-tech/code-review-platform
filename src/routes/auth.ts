import { Router, Request, Response } from 'express';
import { register, login } from '../services/auth';
import { body, validationResult } from 'express-validator';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty(),
    body('role').isIn(['Reviewer', 'Submitter']),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const user = await register(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const token = await login(req.body.email, req.body.password);
      res.json({ token });
    } catch (error) {
      res.status(401).json({ error: (error as Error).message });
    }
  }
);

export default router;