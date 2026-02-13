import { NextRequest, NextResponse } from "next/server";
import db from "../../../prisma/db";
import schema from "./schema";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = schema.safeParse(body)
        if(!validation.success)
            return NextResponse.json(validation.error.errors, {status: 400})

        const user = db.prepare('SELECT * FROM User WHERE email = ?').get(body.email) as any

        if(!user)
            return NextResponse.json({error: 'This user doesnt exist'}, {status: 404})

        const result = db.prepare(
            'INSERT INTO Workout (name, bodyPart, reps, breaks, series, weight, calories, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(body.name, body.bodyPart, body.reps, body.breaks, body.series, body.weight, body.calories, user.id)

        const workout = db.prepare('SELECT * FROM Workout WHERE id = ?').get(result.lastInsertRowid) as any

        return NextResponse.json(workout, {status: 201})
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}