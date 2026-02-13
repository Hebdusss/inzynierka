import {z} from 'zod'

const schema = z.object({
    name: z.string(),
    grams: z.number(),
    kcal: z.number(),
    proteins: z.number(),
    fats: z.number(),
    carbohydrate: z.number(),
    vitamins: z.string(),
    email: z.string().email()
})

export default schema;