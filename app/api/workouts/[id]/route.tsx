import { NextRequest, NextResponse } from "next/server";
import db from "../../../../prisma/db";

export async function DELETE(
    request: NextRequest,
    {params}: {params: {id: string}}
) {
    try {
        const id = parseInt(params.id)
        const workout = db.prepare('SELECT * FROM Workout WHERE id = ?').get(id) as any

        if(!workout)
            return NextResponse.json({error: 'Workout doesnt exist'}, {status: 404})

        db.prepare('DELETE FROM Workout WHERE id = ?').run(id)

        return NextResponse.json(workout)
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}

export async function GET(
    request: NextRequest,
    {params}: {params: {id: string}}) {
    try {
        const workouts = db.prepare('SELECT * FROM Workout WHERE userId = ?').all(params.id)

        return NextResponse.json(workouts, {status: 200})
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, {status: 500})
    }
}