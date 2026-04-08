import { NextRequest, NextResponse } from 'next/server'
import db from '../../../../prisma/db'

/** Normalize any date string to YYYY-MM-DD */
function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null
  // If already YYYY-MM-DD, validate
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''))
  if (isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// POST — sync AI-generated plan to calendar (creates workouts, sets, and schedule entries)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, plan } = body

    if (!email || !plan?.days) {
      return NextResponse.json({ error: 'Missing email or plan' }, { status: 400 })
    }

    const user = db.prepare('SELECT id FROM User WHERE email = ?').get(email) as any
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const createdEntries: any[] = []
    const replacedDates: string[] = []

    const insertWorkout = db.prepare(
      'INSERT INTO Workout (name, bodyPart, reps, breaks, series, weight, calories, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    const insertSet = db.prepare(
      `INSERT INTO "Set" (name, caloriesBurned, caloriesConsumed, totalWorkoutTime, userId, isPublic) VALUES (?, ?, ?, ?, ?, 0)`
    )
    const insertSetWorkout = db.prepare(
      'INSERT INTO _SetWorkouts (setId, workoutId) VALUES (?, ?)'
    )
    const insertSchedule = db.prepare(
      'INSERT INTO Schedule (setId, date, userId) VALUES (?, ?, ?)'
    )

    // Prepared statements for cleanup of old AI entries
    const findOldAiSchedules = db.prepare(
      `SELECT s.id AS schedId, s.setId FROM Schedule s
       JOIN "Set" st ON s.setId = st.id
       WHERE s.userId = ? AND s.date >= ? AND s.date <= ? AND st.name LIKE '%[AI]%'`
    )
    const findSetWorkouts = db.prepare(
      'SELECT workoutId FROM _SetWorkouts WHERE setId = ?'
    )
    const deleteSetWorkoutLinks = db.prepare(
      'DELETE FROM _SetWorkouts WHERE setId = ?'
    )
    const deleteScheduleById = db.prepare(
      'DELETE FROM Schedule WHERE id = ?'
    )
    const deleteSetById = db.prepare(
      `DELETE FROM "Set" WHERE id = ?`
    )
    const deleteWorkoutById = db.prepare(
      'DELETE FROM Workout WHERE id = ?'
    )

    // Figure out the week range (Monday–Sunday) from the plan dates
    const allDates = plan.days.map((d: any) => normalizeDate(d.date)).filter(Boolean) as string[]
    let weekMonday: string | null = null
    let weekSunday: string | null = null
    if (allDates.length) {
      allDates.sort()
      // Derive Monday from the earliest date
      const first = new Date(allDates[0] + 'T12:00:00')
      const dow = first.getDay() // 0=Sun..6=Sat
      const mondayOffset = dow === 0 ? -6 : 1 - dow
      const mon = new Date(first)
      mon.setDate(first.getDate() + mondayOffset)
      const sun = new Date(mon)
      sun.setDate(mon.getDate() + 6)
      weekMonday = normalizeDate(mon.toISOString())
      weekSunday = normalizeDate(sun.toISOString())
    }

    const syncAll = db.transaction(() => {
      // STEP 1: Wipe ALL AI entries for the entire week (Mon–Sun) before inserting new ones
      if (weekMonday && weekSunday) {
        const oldEntries = findOldAiSchedules.all(user.id, weekMonday, weekSunday) as { schedId: number; setId: number }[]
        for (const old of oldEntries) {
          const linkedWorkouts = findSetWorkouts.all(old.setId) as { workoutId: number }[]
          deleteSetWorkoutLinks.run(old.setId)
          deleteScheduleById.run(old.schedId)
          deleteSetById.run(old.setId)
          for (const lw of linkedWorkouts) {
            deleteWorkoutById.run(lw.workoutId)
          }
          replacedDates.push('cleaned')
        }
      }

      // STEP 2: Insert new plan days
      for (const day of plan.days) {
        if (day.type === 'rest' || !day.exercises || day.exercises.length === 0) continue

        const normalizedDate = normalizeDate(day.date)
        if (!normalizedDate) continue

        // Create workouts
        const workoutIds: number[] = []
        for (const ex of day.exercises) {
          const reps = parseInt(String(ex.reps).split('-')[0]) || 10
          const sets = ex.sets || 3
          const rest = parseFloat(String(ex.rest).replace(/s$/i, '')) / 60 || 1.5
          const cal = Math.round((day.caloriesBurned || 300) / Math.max(day.exercises.length, 1))
          const result = insertWorkout.run(
            ex.name,
            day.title || 'AI Workout',
            reps,
            rest,
            sets,
            0,
            cal,
            user.id
          )
          workoutIds.push(Number(result.lastInsertRowid))
        }

        // Create a set
        const setName = `[AI] ${day.title}`
        const setResult = insertSet.run(
          setName,
          day.caloriesBurned || 0,
          0,
          day.totalTime || 60,
          user.id
        )
        const setId = Number(setResult.lastInsertRowid)

        // Link workouts to set
        for (const wId of workoutIds) {
          insertSetWorkout.run(setId, wId)
        }

        // Add to schedule
        const schedResult = insertSchedule.run(setId, normalizedDate, user.id)

        createdEntries.push({
          scheduleId: Number(schedResult.lastInsertRowid),
          setId,
          date: normalizedDate,
          setName,
          workoutCount: workoutIds.length,
        })
      }
    })

    syncAll()

    return NextResponse.json({
      synced: createdEntries,
      replaced: replacedDates,
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
