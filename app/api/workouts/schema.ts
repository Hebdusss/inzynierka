import {z} from 'zod'

const schema = z.object({
    name: z.string(),
    bodyPart: z.string(),
    reps: z.number(),
    breaks: z.number(),
    series: z.number(),
    weight: z.number(),
    calories: z.number(),
    email: z.string().email()
})

export default schema;