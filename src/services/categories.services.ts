import { categoryRepo } from "../repositories/categories.repo.js";

export const categoryServices = {
    async getAll(){
        return categoryRepo.findAll();
    },

    async post(name: string){
        return await categoryRepo.create(name);
    },

    async patch(id: string, name: string){
        const result = await categoryRepo.update(id, name);

        if(!result){
            throw new Error("Category not found")
        }

        return result
    }
}