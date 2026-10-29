import 'dotenv/config';
import express from 'express';
import { pool } from './config/db.js';
import { errorHandler } from './middleware/error.middleware.js';
import categoryRouter from './routes/category.routes.js';
import expenseRouter from "./routes/expense.routes.js";

const app = express();
app.use(express.json())
const port = process.env.PORT || 3000;

app.use((req, _res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

export const category_count = {count: 0}

app.use(async (req, _res, next) => {
  const result = await pool.query(
    'SELECT * FROM categories'
  )

  category_count.count = result.rowCount ?? 0

  next();
});

app.get('/', (_req, res) => {
  res.send('Hello from Express + TS');
});

app.use("/api/expenses", expenseRouter);
app.use("/api/categories", categoryRouter);

app.use(errorHandler)

const server = app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});   