const mongoose = require('mongoose');

const memberSchema = mongoose.Schema({
    name: String,
    username: String,
    password: String,
    role: String,
    histories: [{
        type: mongoose.Schema.Types.ObjectId, ref: "history"
    }]
})