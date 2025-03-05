const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const bookModel = require('./models/book');
const memberModel = require('./models/member');
const historyModel = require('./models/history');
const member = require('./models/member');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser()); 

app.get('/', (req, res) => {
    res.render('signin');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/signin', (req, res) => {
    res.render('signin');
});

app.get('/dashboard', isLoggedIn, (req, res) => {
    res.render('dashboard');
});

app.get('/create', isAdmin, (req, res) => {
    res.render('create');
});

app.get('/borrow', isLoggedIn, (req, res) => {
    res.render('borrow');
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

app.post('/signout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

app.post('/create', async (req, res) => {
    const {isbn, title, author, location} = req.body;
    
    console.log(req.body.genre);

    let genres = req.body.genre;

    let book = await bookModel({book_id: req.body.bookID});
    if(book) {
        res.redirect('/create');
    }

    book = await bookModel.findOne({isbn});

    if (book) {
        await bookModel.create({
            book_id: req.body.bookId,
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            genre: book.genre,
            location: book.location,
            rating: book.rating,
            borrowed_count: book.borrowed_count,
            histories: []
        });
    }
    else {
        await bookModel.create({
            book_id: req.body.bookId,
            isbn,
            title,
            author,
            genre: genres,
            location,
            rating: 0,
            borrowed_count: 0,
            histories: []
        });
    }

    res.redirect('/create');

});

app.post('/borrow', async (req, res) => {
    const {bookId} = req.body;

    let book = await bookModel.findOne({book_id: bookId});
    let user = await memberModel.findOne({username: req.user.username});

    let history = await historyModel.create({
        member_id: user._id,
        book_id: book._id,
        borrowed_date: new Date(),
        returned_date: null,
        status: "borrowed"
    });

    let histb = book.histories;
    let histm = member.histories;
    histb.push(history._id);
    histm.push(history._id);

    await bookModel.updateOne({book_id: bookId}, {histories: histb});
    await memberModel.updateOne({username: req.user.username}, {histories: histm});

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
        req.user = decoded;
        next();
    });
}

function isAdmin(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/signin');
    }

    jwt.verify(token, 'secretkey', async (err, decoded) => {
        if (err) {
            return res.redirect('/signin');
        }
        const member = await memberModel.findOne({username: decoded.username});
        if (!member.admin_rights) {
            return res.redirect('/dashboard');
        }
        req.user = decoded;
        next();
    });
}


app.listen(3000);
