import {z} from 'zod'

const schema = z.object({
    name: z.string(),
    caloriesBurned: z.number(),
    caloriesConsumed: z.number(),
    totalWorkoutTime: z.number(),
    workouts: z.array(z.number()),
    diets: z.array(z.number()),
    isPublic: z.boolean(),
    userId: z.string()
})

export default schema;