import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
const db = new Database(dbPath)

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    emailVerified TEXT,
    hashedPassword TEXT,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS Account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    UNIQUE(provider, providerAccountId)
  );

  CREATE TABLE IF NOT EXISTS Session (
    id TEXT PRIMARY KEY,
    sessionToken TEXT UNIQUE NOT NULL,
    userId TEXT NOT NULL,
    expires TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS VerificationToken (
    identifier TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires TEXT NOT NULL,
    UNIQUE(identifier, token)
  );

  CREATE TABLE IF NOT EXISTS Workout (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    bodyPart TEXT NOT NULL,
    reps INTEGER NOT NULL DEFAULT 0,
    breaks REAL NOT NULL DEFAULT 0,
    series INTEGER NOT NULL DEFAULT 0,
    weight REAL NOT NULL DEFAULT 0,
    calories INTEGER NOT NULL DEFAULT 0,
    userId TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id)
  );

  CREATE TABLE IF NOT EXISTS Diet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    grams REAL NOT NULL DEFAULT 0,
    kcal INTEGER NOT NULL DEFAULT 0,
    proteins REAL NOT NULL DEFAULT 0,
    fats REAL NOT NULL DEFAULT 0,
    carbohydrate REAL NOT NULL DEFAULT 0,
    vitamins TEXT NOT NULL DEFAULT '',
    userId TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id)
  );

  CREATE TABLE IF NOT EXISTS 'Set' (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    caloriesBurned INTEGER NOT NULL DEFAULT 0,
    caloriesConsumed INTEGER NOT NULL DEFAULT 0,
    totalWorkoutTime REAL NOT NULL DEFAULT 0,
    userId TEXT NOT NULL,
    isPublic INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES User(id)
  );

  CREATE TABLE IF NOT EXISTS _SetWorkouts (
    setId INTEGER NOT NULL,
    workoutId INTEGER NOT NULL,
    PRIMARY KEY (setId, workoutId),
    FOREIGN KEY (setId) REFERENCES 'Set'(id) ON DELETE CASCADE,
    FOREIGN KEY (workoutId) REFERENCES Workout(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS _SetDiets (
    setId INTEGER NOT NULL,
    dietId INTEGER NOT NULL,
    PRIMARY KEY (setId, dietId),
    FOREIGN KEY (setId) REFERENCES 'Set'(id) ON DELETE CASCADE,
    FOREIGN KEY (dietId) REFERENCES Diet(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS Schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setId INTEGER NOT NULL,
    date TEXT NOT NULL,
    userId TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (setId) REFERENCES 'Set'(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
  );

  -- Performance indexes
  CREATE INDEX IF NOT EXISTS idx_user_email ON User(email);
  CREATE INDEX IF NOT EXISTS idx_workout_userId ON Workout(userId);
  CREATE INDEX IF NOT EXISTS idx_diet_userId ON Diet(userId);
  CREATE INDEX IF NOT EXISTS idx_set_userId ON "Set"(userId);
  CREATE INDEX IF NOT EXISTS idx_set_isPublic ON "Set"(isPublic);
  CREATE INDEX IF NOT EXISTS idx_setworkouts_workoutId ON _SetWorkouts(workoutId);
  CREATE INDEX IF NOT EXISTS idx_setdiets_dietId ON _SetDiets(dietId);
  CREATE INDEX IF NOT EXISTS idx_schedule_userId ON Schedule(userId);
  CREATE INDEX IF NOT EXISTS idx_schedule_date ON Schedule(date);
  CREATE INDEX IF NOT EXISTS idx_schedule_userId_date ON Schedule(userId, date);
`)

// Migration: add completed column if it doesn't exist yet
try {
  db.exec(`ALTER TABLE Schedule ADD COLUMN completed INTEGER NOT NULL DEFAULT 0`)
} catch (e) {
  // Column already exists, ignore
}

export default db

// Helper: generate cuid-like ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10)
}
