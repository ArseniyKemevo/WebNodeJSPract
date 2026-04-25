require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/users');
const excursionsRoutes = require('./routes/excursions'); 

const app = express();

app.use(cors()); 
app.use(express.json()); 

app.get('/', (req, res) => {
    res.send('Сервер Microbic успешно работает! 🚀');
});

app.use('/api/auth', authRoutes);

app.use('/api/data', excursionsRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`👉 Проверить: http://localhost:${PORT}`);
    console.log(`=================================`);
});