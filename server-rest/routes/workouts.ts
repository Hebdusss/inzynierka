import { Router } from 'express';
import db from '../prisma';

const router = Router();

// GET /api/workouts/:userId - get all workouts for a user
router.get('/:userId', (req, res) => {
    try {
        const workouts = db.prepare('SELECT * FROM Workout WHERE userId = ?').all(req.params.userId);
        return res.status(200).json(workouts);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/workouts/add - create a new workout
router.post('/add', (req, res) => {
    try {
        const { name, bodyPart, reps, breaks, series, weight, calories, userId } = req.body;

        if (!name || !bodyPart || !userId)
            return res.status(400).json({ error: 'Missing required fields' });

        const result = db.prepare(
            'INSERT INTO Workout (name, bodyPart, reps, breaks, series, weight, calories, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(name, bodyPart, reps || 0, breaks || 0, series || 0, weight || 0, calories || 0, userId);

        const workout = db.prepare('SELECT * FROM Workout WHERE id = ?').get(result.lastInsertRowid);
        return res.status(201).json(workout);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/workouts/:id - delete a workout by id
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const workout = db.prepare('SELECT * FROM Workout WHERE id = ?').get(id);

        if (!workout)
            return res.status(404).json({ error: 'Workout not found' });

        db.prepare('DELETE FROM Workout WHERE id = ?').run(id);
        return res.status(200).json(workout);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;