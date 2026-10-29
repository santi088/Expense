import { pool } from "../config/db.js";
import {z} from "zod";
import { PartialExpense , Expense} from "../zod/expense.schema.js";


export const expenseRepo = {
    async create({category_id, amount, spent_on, note}: Expense){
        const result = await pool.query(
            `INSERT INTO expenses (category_id, amount, spent_on, note)
                VALUES ($1, $2, $3, $4) RETURNING id, amount, note
            `, [category_id, amount, spent_on, note]
        )
        return result.rows[0];
    },

    async findAll(){
        const result = await pool.query(
            `SELECT id, category_id, amount, currency, TO_CHAR(spent_on, 'YYYY-MM-DD') AS spent_on,
            note, created_at FROM expenses
            ORDER BY created_at DESC
            `
        )

        return result.rows
    },

    async findById(id: string){
        const result = await pool.query(
            `SELECT id, category_id, amount, currency, TO_CHAR(spent_on, 'YYYY-MM-DD') AS spent_on,
            note, created_at FROM expenses WHERE id = $1
            `, [id]
        )

        return result.rows[0];
    },

    async update(id: string, body: PartialExpense) {
        // 1. Add "as const" here so TypeScript knows these are exact keys, not just strings
        const allowedCols = ["category_id", "amount", "spent_on", "note", "currency"] as const;
        const setClauses: string[] = [];
        const values: any[] = [id];

        let paramIndex = 2

        for (const col of allowedCols) {
            const val = body[col as keyof typeof body];

            if(val !== undefined){
                setClauses.push(`${col} = $${paramIndex}`)
                values.push(val)
                paramIndex++
            }
        }

        if(setClauses.length === 0){
            throw new Error("No provided fields to update.")
        }

        const query = `
            UPDATE expenses 
            SET ${setClauses.join(", ")} 
            WHERE id = $1 
            RETURNING *
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async delete(id: string){
        const result = await pool.query(
            `DELETE FROM expenses WHERE id = $1
            RETURNING id
            `, [id]
        )

        return result.rows;
    },

    async summary(firstDay: string, lastDay: string){
        const result = await pool.query(`
            SELECT name, COALESCE(SUM(amount), 0) AS total
            FROM categories c
            LEFT JOIN expenses e
            ON c.id = e.category_id
            AND e.spent_on BETWEEN $1 AND $2
            GROUP BY c.name, c.id
            ORDER BY total DESC
        `, [firstDay, lastDay])

        return result.rows
    }
}