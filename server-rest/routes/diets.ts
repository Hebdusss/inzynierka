import { Router } from 'express';
import db from '../prisma';

const router = Router();

// GET /api/diets/:userId - get all diets for a user
router.get('/:userId', (req, res) => {
    try {
        const diets = db.prepare('SELECT * FROM Diet WHERE userId = ?').all(req.params.userId);
        return res.status(200).json(diets);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/diets/add - create a new diet
router.post('/add', (req, res) => {
    try {
        const { name, grams, kcal, proteins, fats, carbohydrate, vitamins, userId } = req.body;

        if (!name || !userId)
            return res.status(400).json({ error: 'Missing required fields' });

        const result = db.prepare(
            'INSERT INTO Diet (name, grams, kcal, proteins, fats, carbohydrate, vitamins, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(name, grams || 0, kcal || 0, proteins || 0, fats || 0, carbohydrate || 0, vitamins || '', userId);

        const diet = db.prepare('SELECT * FROM Diet WHERE id = ?').get(result.lastInsertRowid);
        return res.status(201).json(diet);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/diets/:id - delete a diet by id
router.delete('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const diet = db.prepare('SELECT * FROM Diet WHERE id = ?').get(id);

        if (!diet)
            return res.status(404).json({ error: 'Diet not found' });

        db.prepare('DELETE FROM Diet WHERE id = ?').run(id);
        return res.status(200).json(diet);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;