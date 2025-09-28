import express, { Request, Response } from 'express';
import pool from './config/db';

const app = express();
app.use(express.json());


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