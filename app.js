const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');


const bookModel = require('./models/book');
const memberModel = require('./models/member');
const historyModel = require('./models/history');
const member = require('./models/member');
const book = require('./models/book');


app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser()); 
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.redirect('/signin');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/signin', (req, res) => {
    res.render('signin');
});

app.get('/dashboard', isLoggedIn, async (req, res) => {
    console.log('User in dashboard route:', req.user);

    let member = await memberModel.findOne({username: req.user.username}); 
    let booksB = [], booksR = [];
    
    await Promise.all(member.histories.map(async (history) => {
        let hist = await historyModel.findOne({_id: history});
        console.log(hist);
        let book = await bookModel.findOne({_id: hist.book_id});
        if(hist.status == "borrowed") {
            booksB.push(book);
            console.log(booksB);
        } else {
            booksR.push(book);
        }
    }));

    console.log(5);
    console.log(booksB + ' ' + booksR);
    res.render('dashboard', {member, booksB, booksR});
});

app.get('/admin', isAdmin, (req, res) => {
    res.render('admin');
});

app.get('/create', isAdmin, (req, res) => {
    res.render('create');
});

app.get('/borrow', isLoggedIn, (req, res) => {
    res.render('borrow');
});

app.get('/return', isAdmin, (req, res) => {
    res.render('return');
});

app.get('/book:isbn', isLoggedIn, async (req, res) => {

    let book = await bookModel.findOne({isbn: req.params.isbn});


    if(!book) {
        return res.redirect('/dashboard');
    }

    res.render('book', {book});
});

app.get('/update', isAdmin, (req, res) => {
    res.render('update');
});

app.get('/update:bookId', isAdmin, async (req, res) => {

    let book = await bookModel.findOne({book_id: req.params.bookId});
    res.render('update', {book});
});

app.get('/delete', isAdmin, async (req, res) => {
    res.render('delete');
});

app.get('/search', isLoggedIn, async (req, res) => {
    const query = req.query.query;
    const regex = new RegExp(query, 'i'); // 'i' makes it case-insensitive

    const books = await bookModel.find({
        $or: [
            { title: { $regex: regex } },
            { author: { $regex: regex } }
        ]
    });

    res.render('searchResults', { books });
});

app.get('/book/:book_id', isLoggedIn, async (req, res) => {
    let book = await bookModel.findOne({book_id: req.params.book_id});
    if (!book) {
        return res.redirect('/dashboard');
    }
    res.render('bookDetails', {book});
});

app.get('/addRatingReview/:book_id', isLoggedIn, (req, res) => {
    res.render('addRatingReview', {book_id: req.params.book_id});
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
        admin_rights: false,
        member_Status: true,
        histories: []
    });
    
    res.redirect('/signin');
});

app.post('/signin', async (req, res) => {
    const {username, password} = req.body;

    let member = await memberModel.findOne({username});

    if (!member || member.member_Status == false) {
        return res.redirect('/signin');
    }

    if (!bcrypt.compareSync(password, member.password)) {
        return res.redirect('/signin');
    }

    const token = jwt.sign({username: username}, 'secretkey');
    res.cookie('token', token);

    if (member.admin_rights) {
        return res.redirect('/admin');
    }

    res.redirect('/dashboard');
});

app.post('/signout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

app.post('/create', isAdmin, async (req, res) => {
    const {isbn, title, author, location} = req.body;
    
    console.log(req.body.genre);
    console.log(req.user);

    let genres = req.body.genre;

    let book = await bookModel.findOne({book_id: req.body.bookID});
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
            rating_count: book.rating_count,
            histories: [],
            book_status: book.book_status,
            reviews: book.reviews
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
            rating_count: 0,
            histories: [],
            book_status: true,
            reviews: []
        });
    }

    res.redirect('/create');

});

app.post('/borrow', isLoggedIn, async (req, res) => {
    const {bookId} = req.body;
    
    console.log(req.user);;
    let book = await bookModel.findOne({book_id: bookId, book_status: true});

    if (!book || book.status == false) {
        return res.redirect('/borrow');
    }

    let history = await historyModel.findOne({book_id: book._id, status: "borrowed"});
    if (history) {
        return res.redirect('/borrow');
    }

    let member = await memberModel.findOne({username: req.user.username});

    history = await historyModel.create({
        member_id: member._id,
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

app.post('/return', isAdmin, async (req, res) => {
    const {bookId} = req.body;

    let book = await bookModel.findOne({book_id: bookId});

    if (!book) {
        return res.redirect('/return');
    }

    let history = await historyModel.findOne({book_id: book._id, status: "borrowed"});
    if (!history || history.status == "returned") {
        return res.redirect('/return');
    }

    history = await historyModel.findOneAndUpdate({book_id: book._id, status: "borrowed"}, {returned_date: new Date(), status: "returned"});

    res.redirect('/admin');


});

app.post('/delete', isAdmin, async (req, res) => {
    const {bookId} = req.body;

    let book = await bookModel.findOneAndUpdate({book_id: bookId}, {book_status: false});

    res.redirect('/admin');

});

app.post('/update', isAdmin, async (req, res) => {
    const {bookId, title, author, location, genre, isbn} = req.body;

    let book = await bookModel.findOneAndUpdate({book_id: bookId}, {isbn, title, author, location, genre});

    if(!book)
    res.redirect('/update');

    res.redirect('/admin');
});

app.post('/submitRatingReview/', isLoggedIn, async (req, res) => {
    
    let {rating, review, book_id} = req.body;

    const bookthis = await bookModel.findOne({book_id});
    const isbn = bookthis.isbn;


    let books = await bookModel.find({isbn});

    if(!books) {
        return res.redirect('/dashboard');
    };

    console.log(books);

    let reviews = books[0].reviews;
    reviews.push(review);

    rating = Number(books[0].rating) + Number(rating);
    rating_count = Number(books[0].rating_count) + 1;

    

    books.forEach(async (book) => {
        await bookModel.updateOne({book_id: book.book_id}, {rating: rating, rating_count: rating_count, reviews: reviews});
    });

    res.redirect('/dashboard');

});




function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        console.log('No token found');
        return res.redirect('/signin');
    }

    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            console.log('Token verification failed', err);
            return res.redirect('/signin');
        }
        req.user = decoded;
        console.log('User decoded from token:', req.user);
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
