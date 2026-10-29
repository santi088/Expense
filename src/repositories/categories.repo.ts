import { pool } from "../config/db.js"
export const categoryRepo = {
    async findAll() {
        const result = await pool.query(
            "SELECT * FROM categories"
        )
        return result.rows;
    },
    async create(name: string){
        const result = await pool.query(
            `INSERT INTO categories (name) 
             VALUES ($1) RETURNING *`, [name] 
        )

        return result.rows[0];
    },
    async update(id: string, name: string){
        const result = await pool.query(`
            UPDATE categories
            SET name = $1
            WHERE id = $2
            RETURNING *
        `, [name, id]
        )

        return result.rows[0] ?? null;
    }
}