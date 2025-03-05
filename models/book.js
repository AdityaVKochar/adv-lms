const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/gdsc-lmsdb');

const bookSchema = mongoose.Schema({
    book_id: String,
    isbn: String,
    title: String,
    author: String,
    genre: [{
        type: String
    }],
    location: String,
    rating: Number,
    rating_count: Number,
    book_status: Boolean,
    histories: [{
        type: mongoose.Schema.Types.ObjectId, ref: "history"
    }],
    reviews : Array
})

module.exports = mongoose.model("book", bookSchema);