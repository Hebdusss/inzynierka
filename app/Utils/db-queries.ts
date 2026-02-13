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
