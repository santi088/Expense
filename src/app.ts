import 'dotenv/config';
import express from 'express';
import { pool } from './config/db.js';
import { errorHandler } from './middleware/error.middleware.js';
import categoryRouter from './routes/category.routes.js';
import expenseRouter from "./routes/expense.routes.js";

const app = express();
app.use(express.json());

app.use((req, _res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});


app.get('/', (_req, res) => {
  res.send('Hello from Express + TS');
});

app.use("/api/expenses", expenseRouter);
app.use("/api/categories", categoryRouter);

app.use(errorHandler)

export default app;