import 'dotenv/config';
import express from 'express';
import { pool } from './db.js';
import {CategoryInput, ExpenseInput, ParamsInput} from './zod/objects.js'
import { z } from 'zod';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();
app.use(express.json())
const port = process.env.PORT || 3000;

app.use((req, _res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

let category_count: number

app.use(async (req, _res, next) => {
  const result = await pool.query(
    'SELECT * FROM categories'
  )

  category_count = result.rowCount ?? 0

  next();
});

app.get('/', (_req, res) => {
  res.send('Hello from Express + TS');
});

app.get('/health', async (_req, res, next) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      message: 'API is running',
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    next(error)
  }
});

function validateBody<T extends z.ZodTypeAny>(schema: T) {
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

app.post('/categories', 
  validateBody(CategoryInput), 
  async (req, res, next) => {
    const {name} = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO categories (name) VALUES ($1) RETURNING *', [name] 
      )

      category_count += 1

      return res.status(201).json({"response": result.rows})

    } catch (err) {
      next(err)
    }
})

app.get('/categories', async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories"
    )

    if(result.rowCount === 0){
      return res.status(200).json({response: 'nothing to see here...'});
    }
    
    return res.status(200).send(result.rows)
  } catch (err) {
    next(err)
  }
})

app.post('/expenses', 
  validateBody(ExpenseInput), 
  async (req, res, next) => {
    const {category_id, amount, spent_on, note} = req.body

    try {

      if(category_id < 1 && category_id > category_count){
        return res.status(400).json({error: "invalid category id."})
      }

      const result = await pool.query(
        `INSERT INTO expenses (category_id, amount, spent_on, note)
         VALUES ($1, $2, $3, $4) RETURNING id, amount, note
        `, [category_id, amount, spent_on, note]
      )

      return res.status(201).json({response: result.rows})

    } catch (err) {
      next(err)
    }
}) 

app.get('/expenses', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, category_id, amount, currency, TO_CHAR(spent_on, 'YYYY-MM-DD') AS spent_on,
       note, created_at FROM expenses
       ORDER BY created_at DESC
       `
    )

    if(result.rowCount === 0){
      return res.status(404).json({response: 'nothing to see here...'});
    }

    return res.status(200).send(result.rows);
  } catch (err) {
    next(err)
  }
})

app.get('/expenses/:id', async (req, res, next) => {
  const id = req.params.id
  try {
    const result = await pool.query(
      `SELECT id, category_id, amount, currency, TO_CHAR(spent_on, 'YYYY-MM-DD') AS spent_on,
       note, created_at FROM expenses WHERE id = $1`, [id]
    )

    if(result.rowCount === 0){
      return res.status(404).json({response: 'nothing to see here...'});
    }

    return res.status(200).send(result.rows);
  } catch (err) {
    next(err)
  }
})

app.patch('/expenses/:id', validateBody(ExpenseInput.partial()), async (req, res, next) => {
  const id = req.params.id
  const body = req.body
  const allowedCols = ["category_id", "amount", "spent_on", "note", "currency"]
  const setValues = []
  for (const col of allowedCols) {
    if(col in body){
      setValues.push(`${col} = ${body[col]}`)
    }
  }

  console.log(setValues.join(", "));
  

  try {
    const result = await pool.query(
      `UPDATE expenses SET ${setValues.join(", ")} WHERE id = $1
       RETURNING *
      `, [id]
    )

    if(result.rowCount === 0){
      return res.status(404).json({response: "not found"})
    }

    return res.status(201).send(result.rows);
  } catch (err) {
    next(err)
  }
})


app.delete('/expenses/:id', validateBody(ExpenseInput.partial()), async (req, res, next) => {
  const id = req.params.id

  try {
    const result = await pool.query(
      `DELETE FROM expenses WHERE id = $1
       RETURNING id
      `, [id]
    )

    if(result.rowCount === 0){
      return res.status(404).json({response: "not found"})
    }

    return res.status(201).send(result.rows);
  } catch (err) {
    next(err)
  }
})

const Months = [
  "JAN", "FEB", "MAR", 
  "APR", "MAY", "JUN", 
  "JUL", "AUG", "SEP", 
  "OCT", "NOV", "DEC"
]

app.get('/summary', async (req, res, next) => {
  const month = req.query.month;
  try {
    if(typeof month !== 'string'){
      return res.status(400).json({"response": "invalid month..."});
    }

    const index = Months.indexOf(month);
    if(index === -1) {
      return res.status(404).json({"response": "not found..."})
    }
    const lastDay = `2026-${String(index + 1).padStart(2, '0')}-${String(new Date(2027, index + 1, 0).getDate()).padStart(2, '0')}`;   
    const firstDay = `2026-${String(index + 1).padStart(2, '0')}-01`;   

    console.log(firstDay, lastDay);
    
    
    const result = await pool.query(`
      SELECT name, COALESCE(SUM(amount), 0) AS total
      FROM categories c
      LEFT JOIN expenses e
      ON c.id = e.category_id
      AND e.spent_on BETWEEN $1 AND $2
      GROUP BY c.name, c.id
      ORDER BY total DESC
    `, [firstDay, lastDay])

    return res.status(200).send(result.rows);

  } catch (err) {
    next(err)
  }
  
})

app.use(errorHandler)

const server = app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});   