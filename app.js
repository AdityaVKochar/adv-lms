const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const bookModel = require('./models/book');
const memberModel = require('./models/member');
const historyModel = require('./models/history');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser()); 

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/signin', (req, res) => {
    res.render('signin');
});

app.post('/signup', (req, res) => {
    const {name, username, password} = req.body;
    const member = new memberModel({
        name,
        username,
        password: bcrypt.hashSync(password, 10),
        admin_rights: false
    });
    
    res.redirect('/signin');
});





app.listen(3000);
