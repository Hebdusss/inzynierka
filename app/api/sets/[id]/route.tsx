import { NextRequest, NextResponse } from "next/server";
import db from "../../../../prisma/db";

export async function DELETE(
    request: NextRequest,
    {params}: {params: {id: string}}
    ) {
    try {
        const id = parseInt(params.id)
        const set = db.prepare('SELECT * FROM "Set" WHERE id = ?').get(id) as any

        if(!set)
            return NextResponse.json({error: "Not found"}, {status: 404})

        db.transaction(() => {
            db.prepare('DELETE FROM _SetWorkouts WHERE setId = ?').run(id)
            db.prepare('DELETE FROM _SetDiets WHERE setId = ?').run(id)
            db.prepare('DELETE FROM "Set" WHERE id = ?').run(id)
        })()

        set.isPublic = !!set.isPublic
        return NextResponse.json(set, {status: 200})
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}

export async function GET(
    request: NextRequest,
    {params}: {params: {id: string}}
) {
    try {
        const rawSets = db.prepare('SELECT * FROM "Set" WHERE userId = ?').all(params.id) as any[]
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
