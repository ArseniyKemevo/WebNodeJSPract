const express = require('express');
const router = express.Router();
const pool = require('../db'); 

router.post('/register', async (req, res) => {
    try {
        const { full_name, email, login, password, role } = req.body;

        const insertQuery = `
            INSERT INTO users (full_name, email, login, password, role) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING user_id, full_name, email, role;
        `;

        const result = await pool.query(insertQuery, [full_name, email, login, password, role]);

        res.status(201).json({
            message: 'Регистрация успешна',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Ошибка в роуте /register:', error);
        
        if (error.code === '23505') {
            return res.status(400).json({ 
                error: 'Пользователь с таким Email или Логином уже существует' 
            });
        }

        res.status(500).json({ 
            error: 'Внутренняя ошибка сервера при регистрации' 
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        const result = await pool.query(
            'SELECT user_id, full_name, email, role FROM users WHERE login = $1 AND password = $2',
            [login, password]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ 
                message: 'Неверный логин или пароль' 
            });
        }

        res.status(200).json({
            message: 'Успешный вход',
            user: {
                id: user.user_id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Ошибка в роуте /login:', error);
        res.status(500).json({ 
            error: 'Внутренняя ошибка сервера при авторизации' 
        });
    }
});

module.exports = router;