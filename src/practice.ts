import { z } from 'zod';

const UserInput = z.object({
    name: z.string().min(1),
    age: z.number().int().positive(),
    email: z.string().email().optional(),
})

type UserInput = z.infer<typeof UserInput>

function greet(u: UserInput): string {
  return `Hi ${u.name}, age ${u.age}`;
}

const userinputs = [
    { name: "Ana", age: 20 }, 
    { name: "", age: 20 },
    { name: "Ana", age: -5 },
    { name: "Ana", age: "20" }
]

for (const ui of userinputs) {
    const result = UserInput.safeParse(ui)
    if(!result.success){
        console.log(result.error.issues);
        continue
    }
    console.log(greet(result.data));
    
}

//didnt have to type UserInput type by hand bc 
//i can infer it from the zod schema




function tryParseAge(input: unknown): number | null {
  // use safeParse; return the age or null, never throw
    const res = z.number().safeParse(input)
    if(!res.success) return null
    return res.data
}

function requireAge(input: unknown): number {
  // use parse; let it throw if invalid
    const res = z.number().parse(input)
    return res
}

const res = tryParseAge("not a number")
console.log(res);

try {
    console.log(requireAge("not a number"));
    
} catch (error) {
    console.log(error);
}

console.log("hello");




const expensesInputs = [
    { amount: 500, spentOn: "2026-10-20" },
    { amount: 500, spentOn: "2026/10/20" },
    { amount: 500, spentOn: "2026-10-20", extra: "nope" }
]

for (const e of expensesInputs) {
    const res = ExpenseInput.safeParse(e)
    if(!res.success){
        console.log(res.error.issues);
        continue
    }
    console.log(true);
    
}

