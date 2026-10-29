import { pool } from "../config/db.js";
export const expenseRepo = {
    async create(category_id: number, amount: number, spent_on: string, note?: string){
        const result = await pool.query(
            `INSERT INTO expenses (category_id, amount, spent_on, note)
                VALUES ($1, $2, $3, $4) RETURNING id, amount, note
            `, [category_id, amount, spent_on, note]
        )
        return result.rows[0];
    }
}