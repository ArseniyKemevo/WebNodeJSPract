const express = require('express');
const router = express.Router();
const pool = require('../db'); 

router.get('/locations', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM locations');

        res.status(200).json({
            count: result.rowCount, 
            data: result.rows      
        });

    } catch (error) {
        console.error('Ошибка при получении локаций:', error);
        res.status(500).json({ error: 'Ошибка сервера при загрузке локаций' });
    }
});

router.get('/excursions', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.excursion_id,
                e.scheduled_time,
                e.max_participants,
                l.title AS location_name,
                u.full_name AS guide_name
            FROM excursions e
            JOIN locations l ON e.location_id = l.location_id
            JOIN users u ON e.guide_id = u.user_id
        `;

        const result = await pool.query(query);

        res.status(200).json({
            count: result.rowCount,
            excursions: result.rows
        });

    } catch (error) {
        console.error('Ошибка при получении экскурсий:', error);
        res.status(500).json({ error: 'Ошибка сервера при загрузке экскурсий' });
    }
});

module.exports = router;