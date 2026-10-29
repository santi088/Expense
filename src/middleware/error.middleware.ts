// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // 1. Handle Body-Parser JSON syntax errors (malformed JSON, trailing commas, etc.)
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'invalid json payload syntax' });
  }

  // 2. Handle errors that already carry an explicit HTTP status code (like 400 from body-parser)
  if (err.status === 400 || err.statusCode === 400) {
    return res.status(400).json({ error: err.message || 'bad request' });
  }

  // 3. PostgreSQL database error codes
  if (err.code === '23505') {
    return res.status(409).json({ error: 'resource already exists' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'referenced resource not found' });
  }
  if (err.code === '23502') {
    return res.status(400).json({ error: 'null value not allowed' });
  }

  // 4. Fallback for unhandled server errors
  console.error(err);
  return res.status(500).json({ error: 'internal server error' });
}