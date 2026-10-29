import express from 'express';
import { z } from 'zod';
import { ParamsInput } from '../zod/expense.schema.js';

export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const result = schema.safeParse(req.body);
    const params = ParamsInput.safeParse(req.params);

    if (!result.success) {
      // single message string
      const msg = result.error.issues[0].message;
      // → "Too small: expected number to be >0"

      // or map all issues to { field, message }
      const errors = result.error.issues.map(i => ({
        field: i.path.join("."),
        message: i.message,
      }));

      return res.status(400).json({ error: errors });
    }
    req.body = result.data;

    if(params.success){
      req.params.id = params.data.id.toString()
    }
  
    next();
  }
}