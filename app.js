// app.js
const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql');
const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

db.connect((err) => {
    if(err) {
        console.log('koneksi database gagal');
    } else {
        console.log('koneksi database berhasil');
    }
});

app.listen(port, () => {
    console.log(`server berjalan di http://localhost:${port}`);
});


cron.schedule('* * * * *', () => {
    // Ambil waktu saat ini (HH:mm)
    const currentTime = new Date().toLocaleTimeString('id-ID', { hour12: false, hour: '2-digit', minute: '2-digit' });

    // Ambil hari saat ini (hari penuh)
    const currentDay = new Date().toLocaleDateString('id-ID', { weekday: 'long' });

    const response = {
        'hari ini': currentDay,
        'waktu ini': currentTime,
    };
    console.log(response);

    // Temukan alarm yang sesuai dengan waktu dan hari saat ini
    const sql = 'SELECT * FROM alarms WHERE time = ? AND FIND_IN_SET(?, day) > 0';
    db.query(sql, [currentTime, currentDay], (err, results) => {
    if (err) {
        console.error('Gagal mendapatkan alarm: ', err);
    } else {
        // Jalankan endpoint untuk setiap alarm yang sesuai
        results.forEach(async (alarm) => {
        try {
            await axios.get(alarm.endpoint);
            console.log(`Endpoint dijalankan untuk alarm pada waktu ${currentTime}`);
        } catch (error) {
            console.error(`Gagal menjalankan endpoint untuk alarm pada waktu ${currentTime}`);
        }
        });
    }
    });
});

app.get('/cek-status-alarm', (req, res) => {
    res.status(200).json({ 
        'status': 'OK',
        'message': 'Alarm app is running' 
    });
});