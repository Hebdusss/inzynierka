import { NextRequest, NextResponse } from "next/server";
import db from "../../../prisma/db";
import schema from "./schema";

function getSetWithRelations(setId: number) {
    const set = db.prepare('SELECT * FROM "Set" WHERE id = ?').get(setId) as any
    if (!set) return null
    set.isPublic = !!set.isPublic
    set.workouts = db.prepare('SELECT w.* FROM Workout w JOIN _SetWorkouts sw ON w.id = sw.workoutId WHERE sw.setId = ?').all(setId)
    set.diets = db.prepare('SELECT d.* FROM Diet d JOIN _SetDiets sd ON d.id = sd.dietId WHERE sd.setId = ?').all(setId)
    return set
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const validation = schema.safeParse(body)
        if(!validation.success)
            return NextResponse.json(validation.error.errors, {status: 400})

        const insertSet = db.transaction(() => {
            const result = db.prepare(
                'INSERT INTO "Set" (name, caloriesBurned, caloriesConsumed, totalWorkoutTime, userId, isPublic) VALUES (?, ?, ?, ?, ?, ?)'
            ).run(body.name, body.caloriesBurned, body.caloriesConsumed, body.totalWorkoutTime, body.userId, body.isPublic ? 1 : 0)

            const setId = result.lastInsertRowid as number

            for (const wId of (body.workouts || [])) {
                db.prepare('INSERT INTO _SetWorkouts (setId, workoutId) VALUES (?, ?)').run(setId, wId)
            }
            for (const dId of (body.diets || [])) {
                db.prepare('INSERT INTO _SetDiets (setId, dietId) VALUES (?, ?)').run(setId, dId)
            }

            return getSetWithRelations(setId)
        })

        const set = insertSet()
        return NextResponse.json(set, {status: 201})
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}

export async function GET(request: NextRequest) {
    try {
        const rawSets = db.prepare('SELECT * FROM "Set" WHERE isPublic = 1').all() as any[]
        const sets = rawSets.map(s => {
            s.isPublic = !!s.isPublic
            s.workouts = db.prepare('SELECT w.* FROM Workout w JOIN _SetWorkouts sw ON w.id = sw.workoutId WHERE sw.setId = ?').all(s.id)
            s.diets = db.prepare('SELECT d.* FROM Diet d JOIN _SetDiets sd ON d.id = sd.dietId WHERE sd.setId = ?').all(s.id)
            return s
        })

        return NextResponse.json(sets, {status: 200})
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}