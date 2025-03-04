const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
    member_id: {
        type: mongoose.Schema.Types.ObjectId, ref: "member"
    },
    book_id: {
        type: mongoose.Schema.Types.ObjectId, ref: "book"
    },
    borrowed_date: Date,
    returned_date: Date,
    status: String
});

module.exports = mongoose.model("history", historySchema);