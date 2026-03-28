const express = require('express');
const path = require('path');
const argon2 = require('@node-rs/argon2');
const con = require('./db');
const app = express();

// allow json exchange
app.use(express.json());
app.use('/cook/view', express.static(path.join(__dirname, 'view')));
app.use('/cook/public', express.static(path.join(__dirname, 'public')));

// generate a hashed password
app.get('/', function (req, res) {
    res.redirect('/cook/view/login.html');
});

app.get('/password/:raw', function(req, res) {
    const raw = req.params.raw;
    const hash = argon2.hashSync(raw);
    // console.log(hash.length);
    res.status(200).send(hash);
});

// login to the system
app.post('/cook/login', function(req, res) {
    // const username = req.body.username;
    // const password = req.body.password;
    const { cookId, password } = req.body;
    // console.log('📥 cookId:', cookId);
    // console.log('📥 password:', password);
    // console.log(username, password);
    // res.end();
    // SQL injection
    // const sql = `SELECT id, role FROM user WHERE username=${username} AND password=${password};`;
    const sql = "SELECT cook_id, name, password FROM cooks WHERE cook_id = ?";
    con.query(sql, [cookId], function(err, results) {
        // console.log('🔍 results:', results);
        // console.log('🔍 err:', err);

        if (err) return res.status(500).send('Server error');

        if (results.length === 0) return res.status(401).json({ message: 'Invalid ID or password' });

        const cook = results[0];
        const valid = argon2.verifySync(cook.password, password);

        if (valid) {
            res.status(200).json({ cookId: cook.cook_id, name: cook.name });
        } else {
            res.status(401).json({ message: 'Invalid ID or password' });
        }
    });
});

app.post('/cook/register', function(req, res) {
    const { cookId, name, password } = req.body;

    const checkSql = "SELECT cook_id FROM cooks WHERE cook_id = ?";
    con.query(checkSql, [cookId], function(err, results) {
        if (err) return res.status(500).send('Server error');
        if (results.length > 0) return res.status(409).json({ message: 'Cook ID already exists' });

        const hash = argon2.hashSync(password);
        const insertSql = "INSERT INTO cooks (cook_id, name, password) VALUES (?, ?, ?)";
        con.query(insertSql, [cookId, name, hash], function(err) {
            if (err) return res.status(500).send('Server error');
            res.status(201).json({ message: 'Account created' });
        });
    });
});

// root service
app.get('/', function(req, res) {
    res.status(200).sendFile(path.join(__dirname, '/cook/view/login.html'));
});

app.listen(3000, function() {
    console.log('Server is running at 3000');
});