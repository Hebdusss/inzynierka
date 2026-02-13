import { NextRequest, NextResponse } from "next/server";
import db from "../../../prisma/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')
        const year = searchParams.get('year')
        const month = searchParams.get('month')

        if (!email || !year || !month) {
            return NextResponse.json({ error: 'Missing email, year, or month' }, { status: 400 })
        }

        const user = db.prepare('SELECT id FROM User WHERE email = ?').get(email) as any
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get all schedule entries for the given month
        const startDate = `${year}-${month.padStart(2, '0')}-01`
        const endDate = `${year}-${month.padStart(2, '0')}-31`

        const schedules = db.prepare(
            `SELECT s.id, s.setId, s.date, s.userId, s.completed,
                    st.name as setName, st.caloriesBurned, st.caloriesConsumed, st.totalWorkoutTime
             FROM Schedule s 
             JOIN "Set" st ON s.setId = st.id 
             WHERE s.userId = ? AND s.date >= ? AND s.date <= ?
             ORDER BY s.date`
        ).all(user.id, startDate, endDate) as any[]

        return NextResponse.json(schedules.map(s => ({ ...s, completed: !!s.completed })))
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, setId, date } = body

        if (!email || !setId || !date) {
            return NextResponse.json({ error: 'Missing email, setId, or date' }, { status: 400 })
        }

        const user = db.prepare('SELECT id FROM User WHERE email = ?').get(email) as any
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const result = db.prepare(
            'INSERT INTO Schedule (setId, date, userId) VALUES (?, ?, ?)'
        ).run(setId, date, user.id)

        const schedule = db.prepare(
            `SELECT s.id, s.setId, s.date, s.userId, s.completed,
                    st.name as setName, st.caloriesBurned, st.caloriesConsumed, st.totalWorkoutTime
             FROM Schedule s 
             JOIN "Set" st ON s.setId = st.id 
             WHERE s.id = ?`
        ).get(result.lastInsertRowid) as any

        return NextResponse.json({ ...schedule, completed: !!schedule.completed }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
