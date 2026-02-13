/**
 * Server-side database query helpers.
 * These bypass the HTTP API layer for direct DB access in server components.
 * This eliminates the anti-pattern of server components making HTTP requests
 * to their own API routes.
 */
import db from '../../prisma/db'

export function getUserIdByEmail(email: string): string | null {
  const user = db.prepare('SELECT id FROM User WHERE email = ?').get(email) as any
  return user?.id ?? null
}

export function getWorkoutsByUserId(userId: string) {
  return db.prepare('SELECT * FROM Workout WHERE userId = ?').all(userId) as any[]
}

export function getDietsByUserId(userId: string) {
  return db.prepare('SELECT * FROM Diet WHERE userId = ?').all(userId) as any[]
}

export function getSetsByUserId(userId: string) {
  const rawSets = db.prepare('SELECT * FROM "Set" WHERE userId = ?').all(userId) as any[]
  return rawSets.map(s => {
    s.isPublic = !!s.isPublic
    s.workouts = db.prepare(
      'SELECT w.* FROM Workout w JOIN _SetWorkouts sw ON w.id = sw.workoutId WHERE sw.setId = ?'
    ).all(s.id)
    s.diets = db.prepare(
      'SELECT d.* FROM Diet d JOIN _SetDiets sd ON d.id = sd.dietId WHERE sd.setId = ?'
    ).all(s.id)
    return s
  })
}

export function getPublicSets() {
  const rawSets = db.prepare('SELECT * FROM "Set" WHERE isPublic = 1').all() as any[]
  return rawSets.map(s => {
    s.isPublic = !!s.isPublic
    s.workouts = db.prepare(
      'SELECT w.* FROM Workout w JOIN _SetWorkouts sw ON w.id = sw.workoutId WHERE sw.setId = ?'
    ).all(s.id)
    s.diets = db.prepare(
      'SELECT d.* FROM Diet d JOIN _SetDiets sd ON d.id = sd.dietId WHERE sd.setId = ?'
    ).all(s.id)
    return s
  })
}

/** Combined query: get workouts + diets for a user email in one call (no HTTP) */
export function getWorkoutsAndDiets(email: string) {
  const userId = getUserIdByEmail(email)
  if (!userId) return { userId: null, workouts: [], diets: [] }
  return {
    userId,
    workouts: getWorkoutsByUserId(userId),
    diets: getDietsByUserId(userId),
  }
}

/** Combined query: get sets + public sets for a user email */
export function getSetsAndPublicSets(email: string) {
  const userId = getUserIdByEmail(email)
  if (!userId) return { sets: [], publicSets: [] }
  return {
    sets: getSetsByUserId(userId),
    publicSets: getPublicSets(),
  }
}

/** Get schedule entries for a given month */
export function getScheduleByMonth(email: string, year: number, month: number) {
  const userId = getUserIdByEmail(email)
  if (!userId) return []

  const monthStr = month.toString().padStart(2, '0')
  const startDate = `${year}-${monthStr}-01`
  const endDate = `${year}-${monthStr}-31`

  const schedules = db.prepare(
    `SELECT s.id, s.setId, s.date, s.userId, s.completed,
            st.name as setName, st.caloriesBurned, st.caloriesConsumed, st.totalWorkoutTime
     FROM Schedule s
     JOIN "Set" st ON s.setId = st.id
     WHERE s.userId = ? AND s.date >= ? AND s.date <= ?
     ORDER BY s.date`
  ).all(userId, startDate, endDate) as any[]

  return schedules.map(s => ({ ...s, completed: !!s.completed }))
}

/** Get all sets for a user (used in calendar sidebar for drag source) */
export function getUserSetsForCalendar(email: string) {
  const userId = getUserIdByEmail(email)
  if (!userId) return []
  
  return db.prepare('SELECT id, name, caloriesBurned, caloriesConsumed, totalWorkoutTime FROM "Set" WHERE userId = ?').all(userId) as any[]
}

/** Get public sets for calendar sidebar (all public sets, including user's own) */
export function getPublicSetsForCalendar(email: string) {
  return db.prepare('SELECT id, name, caloriesBurned, caloriesConsumed, totalWorkoutTime FROM "Set" WHERE isPublic = 1').all() as any[]
}
