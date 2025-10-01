import express, { Request, Response } from 'express';
import pool from './config/db';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import submissionRoutes from './routes/submissions';
import commentRoutes from './routes/comment';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/submissions', commentRoutes);

app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT NOW()');
    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});