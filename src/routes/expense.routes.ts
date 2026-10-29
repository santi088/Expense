import { Router } from "express";
import type { Request } from "express";
import { validateBody } from "../middleware/validateBody.js";
import { expensesServices } from "../services/expenses.service.js";
import { ExpenseInput } from "../zod/expense.schema.js";
import { category_count } from "../index.js";

const router = Router();

// POST /api/expenses
router.post('/', 
  validateBody(ExpenseInput), 
  async (req, res, next) => {
    const { category_id, amount, spent_on, note } = req.body;

    try {      
      const result = await expensesServices.post(category_count.count, category_id, amount, spent_on, note);
      return res.status(201).json({ response: result });
    } catch (err) {
      next(err);
    }
}); 

// GET /api/expenses
router.get('/', async (req, res, next) => {
  try {
    const result = await expensesServices.getAll();

    if (result.length === 0) {
      return res.status(404).json({ response: 'nothing to see here...' });
    }

    return res.status(200).send(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/expenses/summary 
// (Placed BEFORE /:id so Express doesn't confuse the word "summary" for an item ID)
router.get('/summary', async (req, res, next) => {
  const month = req.query.month as string | undefined;
  try {
    const result = await expensesServices.getSummary(month);
    return res.status(200).send(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/expenses/:id
router.get('/:id', async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await expensesServices.getById(id);

    if (!result) {
      return res.status(404).json({ response: 'nothing to see here...' });
    }

    return res.status(200).send(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/expenses/:id
router.patch('/:id', 
  validateBody(ExpenseInput.partial()), 
  async (req: Request<{ id: string }>, res, next) => {
    const id = req.params.id;
    const body = req.body;
 
    try {
      const result = await expensesServices.patch(id, body);

      if (!result) {
        return res.status(404).json({ response: "not found" });
      }

      return res.status(200).json({ response: result });
    } catch (err) {
      next(err);
    }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req: Request<{ id: string }>, res, next) => {
  const id = req.params.id;

  try {
    const result = await expensesServices.deleteById(id);

    if (!result) {
      return res.status(404).json({ response: "not found" });
    }

    return res.status(200).json({ response: result });
  } catch (err) {
    next(err);
  }
});

export default router;