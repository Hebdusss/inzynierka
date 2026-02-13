export type Workout = {
    id: number,
    name: string;
    bodyPart: string;
    reps: number;
    breaks: number;
    series: number;
    weight: number;
    calories: number;
}

export type newWorkout = {
    name: string;
    bodyPart: string;
    reps: number;
    breaks: number;
    series: number;
    weight: number;
    calories: number;
}

export type Diet = {
    id: number;
    name: string;
    grams: number;
    kcal: number;
    proteins: number;
    fats: number;
    carbohydrate: number;
    vitamins: string;
}

export type Set = {
    id: number;
    name: string;
    caloriesBurned: number;
    caloriesConsumed: number;
    totalWorkoutTime: number;
    isPublic: boolean;
    userId: string;
    diets: Diet[],
    workouts: Workout[]
}

export type ScheduleEntry = {
    id: number;
    setId: number;
    date: string;
    userId: string;
    setName: string;
    caloriesBurned: number;
    caloriesConsumed: number;
    totalWorkoutTime: number;
    completed: boolean;
}

export type CalendarSet = {
    id: number;
    name: string;
    caloriesBurned: number;
    caloriesConsumed: number;
    totalWorkoutTime: number;
}