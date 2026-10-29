import { expenseRepo } from "../repositories/expenses.repo.js"
import { PartialExpense, Expense } from "../zod/expense.schema.js";
export const expensesServices = {
    async post({category_id, amount, spent_on, note}: Expense){

        const result = await expenseRepo.create({category_id, amount, spent_on, note});

        return result;
    },

    async getAll(){
        return await expenseRepo.findAll();
    },

    async getById(id: string){
        return await expenseRepo.findById(id);
    },

    async patch(id: string, body: PartialExpense){
        return expenseRepo.update(id, body)
    },

    async deleteById(id: string){
        return await expenseRepo.delete(id);
    },

    async getSummary(month: any){
        const Months = [
            "JAN", "FEB", "MAR", 
            "APR", "MAY", "JUN", 
            "JUL", "AUG", "SEP", 
            "OCT", "NOV", "DEC"
        ]

        const index = Months.indexOf(month);

        if(typeof month !== 'string' || index === -1){
            throw new Error("invalid month...");
        }
        
    
        const lastDay = `2026-${String(index + 1).padStart(2, '0')}-${String(new Date(2027, index + 1, 0).getDate()).padStart(2, '0')}`;   
        const firstDay = `2026-${String(index + 1).padStart(2, '0')}-01`;   
    
        return await expenseRepo.summary(firstDay, lastDay)
    }
}