import { expenseRepo } from "../repositories/expenses.repo.js"

export const expensesServices = {
    async post(category_count: number, category_id: number, amount: number, spent_on: string, note?: string){
        
        if(category_id < 1 || category_id > category_count){
            throw new Error("invalid category id.")
        }
        
        const result = await expenseRepo.create(category_id, amount, spent_on, note);

        return result;
    }
}