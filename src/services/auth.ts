import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { User } from '../models/user';

export async function register(user: Omit<User, 'id'>): Promise<User> {
  const { email, password, name, picture, role } = user;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (email, password, name, picture, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [email, hashedPassword, name, picture, role]
  );
  return result.rows[0];
}

export async function login(email: string, password: string): Promise<string> {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1h' });
}