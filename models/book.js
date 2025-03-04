const mongoose = require('mongoose');


const bookSchema = mongoose.Schema({
    isbn: String,
    title: String,
    author: String,
    genre: [{
        type: String
    }],
    location: String,
    rating: Number,
    borrowed_count: Number,
    histories: [{
        type: mongoose.Schema.Types.ObjectId, ref: "history"
    }]
})