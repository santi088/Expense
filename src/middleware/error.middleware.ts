// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.code === '23505') {
    return res.status(409).json({ error: 'resource already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'referenced resource not found' });
  }
  if (err.code === '23502') {
    return res.status(400).json({ error: 'null value not allowed' });
  }

  console.error(err);
  return res.status(500).json({ error: 'internal server error' });
}   