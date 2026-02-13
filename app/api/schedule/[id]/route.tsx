import { NextRequest, NextResponse } from "next/server";
import db from "../../../../prisma/db";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
        }

        const existing = db.prepare('SELECT * FROM Schedule WHERE id = ?').get(id) as any
        if (!existing) {
            return NextResponse.json({ error: 'Schedule entry not found' }, { status: 404 })
        }

        db.prepare('DELETE FROM Schedule WHERE id = ?').run(id)
        return NextResponse.json({ message: 'Schedule entry deleted' })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
        }

        const body = await request.json()
        const { date, completed } = body

        const existing = db.prepare('SELECT * FROM Schedule WHERE id = ?').get(id) as any
        if (!existing) {
            return NextResponse.json({ error: 'Schedule entry not found' }, { status: 404 })
        }

        if (date !== undefined) {
            db.prepare('UPDATE Schedule SET date = ? WHERE id = ?').run(date, id)
        }
        if (completed !== undefined) {
            db.prepare('UPDATE Schedule SET completed = ? WHERE id = ?').run(completed ? 1 : 0, id)
        }

        const updated = db.prepare(
            `SELECT s.id, s.setId, s.date, s.userId, s.completed,
                    st.name as setName, st.caloriesBurned, st.caloriesConsumed, st.totalWorkoutTime
             FROM Schedule s 
             JOIN "Set" st ON s.setId = st.id 
             WHERE s.id = ?`
        ).get(id) as any

        return NextResponse.json({ ...updated, completed: !!updated.completed })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
