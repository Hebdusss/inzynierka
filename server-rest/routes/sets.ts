import { Router } from 'express';
import db from '../prisma';

const router = Router();

function enrichSet(s: any) {
    s.isPublic = !!s.isPublic;
    s.workouts = db.prepare('SELECT w.* FROM Workout w JOIN _SetWorkouts sw ON w.id = sw.workoutId WHERE sw.setId = ?').all(s.id);
    s.diets = db.prepare('SELECT d.* FROM Diet d JOIN _SetDiets sd ON d.id = sd.dietId WHERE sd.setId = ?').all(s.id);
    return s;
}

// GET /api/sets/:userId - get all sets for a user
router.get('/:userId', (req, res) => {
    try {
        const sets = (db.prepare('SELECT * FROM "Set" WHERE userId = ?').all(req.params.userId) as any[]).map(enrichSet);
        return res.status(200).json(sets);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/sets - get all public sets
router.get('/', (req, res) => {
    try {
        const sets = (db.prepare('SELECT * FROM "Set" WHERE isPublic = 1').all() as any[]).map(enrichSet);
        return res.status(200).json(sets);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/sets/add - create a new set
router.post('/add', (req, res) => {
    try {
        const { name, caloriesBurned, caloriesConsumed, totalWorkoutTime, workouts, diets, userId, isPublic } = req.body;

        if (!name || !userId)
            return res.status(400).json({ error: 'Missing required fields' });

        const insertSet = db.transaction(() => {
            const result = db.prepare(
                'INSERT INTO "Set" (name, caloriesBurned, caloriesConsumed, totalWorkoutTime, userId, isPublic) VALUES (?, ?, ?, ?, ?, ?)'
            ).run(name, caloriesBurned || 0, caloriesConsumed || 0, totalWorkoutTime || 0, userId, isPublic ? 1 : 0);

            const setId = result.lastInsertRowid as number;

            for (const wId of (workouts || [])) {
                db.prepare('INSERT INTO _SetWorkouts (setId, workoutId) VALUES (?, ?)').run(setId, wId);
            }
            for (const dId of (diets || [])) {
                db.prepare('INSERT INTO _SetDiets (setId, dietId) VALUES (?, ?)').run(setId, dId);
            }

            return enrichSet(db.prepare('SELECT * FROM "Set" WHERE id = ?').get(setId) as any);
        });

        const set = insertSet();
        return res.status(201).json(set);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/sets/:id - delete a set by id
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const set = db.prepare('SELECT * FROM "Set" WHERE id = ?').get(id) as any;

        if (!set)
            return res.status(404).json({ error: 'Set not found' });

        db.transaction(() => {
            db.prepare('DELETE FROM _SetWorkouts WHERE setId = ?').run(id);
            db.prepare('DELETE FROM _SetDiets WHERE setId = ?').run(id);
            db.prepare('DELETE FROM "Set" WHERE id = ?').run(id);
        })();

        set.isPublic = !!set.isPublic;
        return res.status(200).json(set);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;