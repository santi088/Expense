import { Router } from "express";
import type { Request } from "express";
import { validateBody } from "../middleware/validateBody.js";
import { CategoryInput } from "../zod/expense.schema.js";
import { categoryServices } from "../services/categories.services.js";
import { category_count } from "../index.js";

const router = Router();

// POST /api/categories
router.post('/', 
  validateBody(CategoryInput), 
  async (req, res, next) => {
    const { name } = req.body;
    try {
      const result = await categoryServices.post(name);
      category_count.count += 1;

      return res.status(201).json({ response: result });
    } catch (err) {
      next(err);
    }
});

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const result = await categoryServices.getAll();
    if (result.length === 0) {
      return res.status(200).json({ response: 'nothing to see here...' });
    }
    
    return res.status(200).send(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/categories/:id
router.patch('/:id', 
  validateBody(CategoryInput.partial()),
  async (req: Request<{ id: string }>, res, next) => {
    try {
      const id = req.params.id;
      const { name } = req.body;
      const result = await categoryServices.patch(id, name);

      return res.status(200).json({ response: result });
    } catch (err) {
      next(err);
    }
});

export default router;