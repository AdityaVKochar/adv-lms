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

app.get('/dashboard', isLoggedIn, (req, res) => {
    res.render('dashboard');
});

app.post('/signup', async (req, res) => {
    const {name, username, password} = req.body;

    let member = await memberModel.findOne({username});
    if (member) {
        return res.redirect('/signup');
    }

    member = await memberModel.create({
        name,
        username,
        password: bcrypt.hashSync(password, 10),
        admin_rights: false
    });
    
    res.redirect('/signin');
});

app.post('/signin', async (req, res) => {
    const {username, password} = req.body;

    let member = await memberModel.findOne({username});

    if (!member) {
        return res.redirect('/signin');
    }

    if (!bcrypt.compareSync(password, member.password)) {
        return res.redirect('/signin');
    }

    const token = jwt.sign({username}, 'secretkey');
    res.cookie('token', token);
    res.redirect('/dashboard');
});


function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/signin');
    }

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            return res.redirect('/signin');
        }

        next();
    });
}


app.listen(3000);
