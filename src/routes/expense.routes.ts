import { Router } from "express";
import type { Request } from "express";
import { validateBody } from "../middleware/validateBody.js";
import { expensesServices } from "../services/expenses.service.js";
import { ExpenseInput } from "../zod/expense.schema.js";

const router = Router();

// POST /api/expenses
router.post('/', validateBody(ExpenseInput), async (req, res) => {
  const result = await expensesServices.post(req.body);
  return res.status(201).json({ response: result });
}); 

// GET /api/expenses
router.get('/', async (req, res) => {
  const result = await expensesServices.getAll();

  if (result.length === 0) {
    return res.status(404).json({ response: 'nothing to see here...' });
  }

  return res.status(200).send(result);
});

// GET /api/expenses/summary
router.get('/summary', async (req, res) => {
  const month = req.query.month as string | undefined;
  const result = await expensesServices.getSummary(month);
  return res.status(200).send(result);
});

// GET /api/expenses/:id
router.get('/:id', async (req, res) => {
  const id = req.params.id;

  if(Number.isNaN(Number(id))){
    return res.status(400).json({"error": "invalid id"})
  }

  const result = await expensesServices.getById(id);

  if (!result) {
    return res.status(404).json({ response: 'nothing to see here...' });
  }

  return res.status(200).send(result);
});

// PATCH /api/expenses/:id
router.patch('/:id', validateBody(ExpenseInput.partial()), async (req: Request<{ id: string }>, res) => {
  const id = req.params.id;
  const body = req.body;
  
  const result = await expensesServices.patch(id, body);

  if (!result) {
    return res.status(404).json({ response: "not found" });
  }

  return res.status(200).json({ response: result });
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req: Request<{ id: string }>, res) => {
  const id = req.params.id;
  const result = await expensesServices.deleteById(id);

  if (!result) {
    return res.status(404).json({ response: "not found" });
  }

  return res.status(200).json({ response: result });
});

export default router;