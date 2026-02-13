const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'dev.db'));
db.pragma('foreign_keys = ON');

// Find user
const user = db.prepare("SELECT id, email FROM User WHERE email = 'hebdusss11@gmail.com'").get();
if (!user) {
  console.error('User hebdusss11@gmail.com not found!');
  process.exit(1);
}
const userId = user.id;
console.log('Found user:', userId);

// Clear all existing data
db.exec("DELETE FROM _SetWorkouts");
db.exec("DELETE FROM _SetDiets");
db.exec("DELETE FROM Schedule");
db.exec("DELETE FROM 'Set'");
db.exec("DELETE FROM Workout");
db.exec("DELETE FROM Diet");
console.log('Cleared all existing data');

// === INSERT WORKOUTS ===
const insertWorkout = db.prepare(
  "INSERT INTO Workout (name, bodyPart, reps, breaks, series, weight, calories, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

const workouts = [
  // Chest
  ['Wyciskanie sztangi na ławce', 'Klatka piersiowa', 10, 2, 4, 80, 120, userId],
  ['Wyciskanie hantli na skosie', 'Klatka piersiowa', 12, 1.5, 3, 30, 95, userId],
  ['Rozpiętki na maszynie', 'Klatka piersiowa', 15, 1, 3, 25, 70, userId],
  // Back
  ['Podciąganie na drążku', 'Plecy', 8, 2, 4, 0, 110, userId],
  ['Wiosłowanie sztangą', 'Plecy', 10, 2, 4, 60, 100, userId],
  ['Ściąganie drążka wyciągu', 'Plecy', 12, 1.5, 3, 50, 85, userId],
  // Legs
  ['Przysiady ze sztangą', 'Nogi', 10, 3, 4, 100, 180, userId],
  ['Wyprosty nóg na maszynie', 'Nogi', 15, 1, 3, 40, 75, userId],
  ['Uginanie nóg leżąc', 'Nogi', 12, 1.5, 3, 35, 65, userId],
  ['Wykroki z hantlami', 'Nogi', 12, 2, 3, 20, 90, userId],
  // Shoulders
  ['Wyciskanie żołnierskie', 'Barki', 10, 2, 4, 40, 95, userId],
  ['Unoszenie hantli bokiem', 'Barki', 15, 1, 3, 10, 55, userId],
  ['Face pull na wyciągu', 'Barki', 15, 1, 3, 20, 50, userId],
  // Arms
  ['Uginanie ramion ze sztangą', 'Biceps', 12, 1.5, 3, 30, 60, userId],
  ['Uginanie hantli młotkowo', 'Biceps', 12, 1, 3, 14, 50, userId],
  ['Prostowanie ramion na wyciągu', 'Triceps', 15, 1, 3, 25, 55, userId],
  ['Pompki na poręczach', 'Triceps', 10, 2, 3, 0, 80, userId],
  // Core
  ['Plank', 'Brzuch', 1, 1, 3, 0, 30, userId],
  ['Brzuszki na maszynie', 'Brzuch', 20, 1, 3, 30, 45, userId],
  ['Unoszenie nóg w zwisie', 'Brzuch', 12, 1.5, 3, 0, 40, userId],
  // Cardio
  ['Bieg na bieżni', 'Cardio', 1, 0, 1, 0, 350, userId],
  ['Wiosłowanie na ergometrze', 'Cardio', 1, 0, 1, 0, 280, userId],
];

const workoutIds = [];
for (const w of workouts) {
  const result = insertWorkout.run(...w);
  workoutIds.push(Number(result.lastInsertRowid));
}
console.log(`Inserted ${workoutIds.length} workouts`);

// === INSERT DIETS ===
const insertDiet = db.prepare(
  "INSERT INTO Diet (name, grams, kcal, proteins, fats, carbohydrate, vitamins, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);

const diets = [
  ['Pierś z kurczaka grillowana', 200, 330, 62, 7, 0, 'B3, B6', userId],
  ['Ryż brązowy', 250, 290, 6, 2.5, 62, 'B1, B6, Magnez', userId],
  ['Brokuły gotowane', 150, 52, 5, 0.5, 7, 'C, K, A', userId],
  ['Jajka sadzone (3 szt)', 180, 280, 19, 21, 1.5, 'B12, D, A', userId],
  ['Owsianka z bananem', 300, 380, 12, 7, 68, 'B1, B6, Potas', userId],
  ['Łosoś pieczony', 200, 412, 40, 27, 0, 'D, B12, Omega-3', userId],
  ['Sałatka grecka', 250, 190, 6, 14, 10, 'A, C, K, E', userId],
  ['Shake proteinowy', 400, 240, 48, 3, 8, 'B6, B12, Żelazo', userId],
  ['Makaron pełnoziarnisty z tuńczykiem', 350, 450, 35, 8, 60, 'B1, B3, Selen', userId],
  ['Jogurt naturalny z orzechami', 200, 280, 14, 18, 16, 'B2, E, Wapń', userId],
  ['Twarożek z rzodkiewką', 200, 180, 22, 5, 8, 'B12, A, Wapń', userId],
  ['Koktajl owocowy', 350, 210, 4, 1, 48, 'C, A, Potas', userId],
  ['Batata pieczona', 250, 225, 4, 0.3, 52, 'A, C, B6', userId],
  ['Pierś z indyka z warzywami', 300, 360, 52, 8, 18, 'B3, B6, C', userId],
  ['Hummus z warzywami', 200, 310, 12, 18, 28, 'B6, Żelazo, Magnez', userId],
];

const dietIds = [];
for (const d of diets) {
  const result = insertDiet.run(...d);
  dietIds.push(Number(result.lastInsertRowid));
}
console.log(`Inserted ${dietIds.length} diets`);

// === INSERT SETS ===
const insertSet = db.prepare(
  "INSERT INTO 'Set' (name, caloriesBurned, caloriesConsumed, totalWorkoutTime, userId, isPublic) VALUES (?, ?, ?, ?, ?, ?)"
);
const insertSetWorkout = db.prepare(
  "INSERT INTO _SetWorkouts (setId, workoutId) VALUES (?, ?)"
);
const insertSetDiet = db.prepare(
  "INSERT INTO _SetDiets (setId, dietId) VALUES (?, ?)"
);

// w = workout index, d = diet index (0-based from arrays above)
const sets = [
  // PRIVATE SETS (isPublic = 0)
  {
    name: 'Push Day',
    burned: 285, consumed: 950,
    time: 55, isPublic: 0,
    workoutIdxs: [0, 1, 2, 10, 15, 16], // bench, incline DB, pec deck, OHP, pushdowns, dips
    dietIdxs: [0, 1, 7, 3]  // chicken, rice, protein shake, eggs
  },
  {
    name: 'Pull Day',
    burned: 295, consumed: 880,
    time: 50, isPublic: 0,
    workoutIdxs: [3, 4, 5, 13, 14, 12], // pullups, rows, lat pulldown, curls, hammer curls, face pull
    dietIdxs: [5, 8, 9]  // salmon, pasta tuna, yogurt nuts
  },
  {
    name: 'Leg Day',
    burned: 410, consumed: 1050,
    time: 60, isPublic: 0,
    workoutIdxs: [6, 7, 8, 9, 17, 18], // squats, leg ext, leg curl, lunges, plank, machine crunch
    dietIdxs: [0, 1, 4, 12]  // chicken, rice, oatmeal, sweet potato
  },
  {
    name: 'Poranny Cardio + Core',
    burned: 420, consumed: 590,
    time: 40, isPublic: 0,
    workoutIdxs: [20, 17, 18, 19], // treadmill, plank, machine crunch, hanging leg raise
    dietIdxs: [4, 11]  // oatmeal banana, fruit cocktail
  },
  {
    name: 'Ramiona & Barki',
    burned: 260, consumed: 760,
    time: 45, isPublic: 0,
    workoutIdxs: [10, 11, 12, 13, 14, 15, 16], // OHP, lateral raise, face pull, curls, hammer, pushdowns, dips
    dietIdxs: [0, 1, 10]  // chicken, rice, cottage cheese
  },

  // PUBLIC SETS (isPublic = 1)
  {
    name: 'Full Body Beginner',
    burned: 350, consumed: 900,
    time: 50, isPublic: 1,
    workoutIdxs: [0, 3, 6, 10, 17], // bench, pullups, squats, OHP, plank
    dietIdxs: [0, 1, 2, 7]  // chicken, rice, broccoli, shake
  },
  {
    name: 'Masa - Góra',
    burned: 380, consumed: 1200,
    time: 65, isPublic: 1,
    workoutIdxs: [0, 1, 4, 5, 10, 13, 15], // bench, incline, rows, lat pull, OHP, curls, pushdowns
    dietIdxs: [0, 1, 3, 5, 7]  // chicken, rice, eggs, salmon, shake
  },
  {
    name: 'Redukcja - Cardio Mix',
    burned: 630, consumed: 620,
    time: 45, isPublic: 1,
    workoutIdxs: [20, 21, 17, 19], // treadmill, rowing, plank, hanging leg raise
    dietIdxs: [6, 11, 2]  // greek salad, fruit cocktail, broccoli
  },
  {
    name: 'Plecy & Biceps Classic',
    burned: 295, consumed: 740,
    time: 50, isPublic: 1,
    workoutIdxs: [3, 4, 5, 12, 13, 14], // pullups, rows, lat pull, face pull, curls, hammer
    dietIdxs: [8, 9, 10]  // pasta tuna, yogurt, cottage cheese
  },
  {
    name: 'Nogi & Brzuch Power',
    burned: 390, consumed: 855,
    time: 55, isPublic: 1,
    workoutIdxs: [6, 7, 8, 9, 17, 18, 19], // squats, ext, curl, lunges, plank, crunch, hanging
    dietIdxs: [12, 1, 4, 14]  // sweet potato, rice, oatmeal, hummus
  },
];

for (const s of sets) {
  const res = insertSet.run(s.name, s.burned, s.consumed, s.time, userId, s.isPublic);
  const setId = Number(res.lastInsertRowid);
  for (const wi of s.workoutIdxs) {
    insertSetWorkout.run(setId, workoutIds[wi]);
  }
  for (const di of s.dietIdxs) {
    insertSetDiet.run(setId, dietIds[di]);
  }
}
console.log(`Inserted ${sets.length} sets (${sets.filter(s=>s.isPublic===0).length} private, ${sets.filter(s=>s.isPublic===1).length} public)`);

// Verify
const wc = db.prepare('SELECT COUNT(*) as c FROM Workout').get();
const dc = db.prepare('SELECT COUNT(*) as c FROM Diet').get();
const sc = db.prepare("SELECT COUNT(*) as c FROM 'Set'").get();
const swc = db.prepare('SELECT COUNT(*) as c FROM _SetWorkouts').get();
const sdc = db.prepare('SELECT COUNT(*) as c FROM _SetDiets').get();
console.log(`\nFinal counts: ${wc.c} workouts, ${dc.c} diets, ${sc.c} sets, ${swc.c} set-workouts, ${sdc.c} set-diets`);

db.close();
console.log('Done!');
