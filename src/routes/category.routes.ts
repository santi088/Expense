import { Router } from "express";
import type { Request } from "express";
import { validateBody } from "../middleware/validateBody.js";
import { CategoryInput } from "../zod/expense.schema.js";
import { categoryServices } from "../services/categories.services.js";

const router = Router();

// POST /api/categories
router.post('/', validateBody(CategoryInput), async (req, res) => {
  const { name } = req.body;
  const result = await categoryServices.post(name);

  return res.status(201).json({ response: result });
});

// GET /api/categories
router.get('/', async (req, res) => {
  const result = await categoryServices.getAll();
  
  if (result.length === 0) {
    return res.status(200).json({ response: 'nothing to see here...' });
  }
  
  return res.status(200).send(result);
});

// PATCH /api/categories/:id
router.patch('/:id', validateBody(CategoryInput.partial()), async (req: Request<{ id: string }>, res) => {
  const id = req.params.id;
  const { name } = req.body;
  
  const result = await categoryServices.patch(id, name);

  return res.status(200).json({ response: result });
});

export default router;