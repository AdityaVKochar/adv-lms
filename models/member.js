const mongoose = require('mongoose');

const memberSchema = mongoose.Schema({
    name: String,
    username: String,
    password: String,
    admin_rights: Boolean,
    histories: [{
        type: mongoose.Schema.Types.ObjectId, ref: "history"
    }]
})

module.exports = mongoose.model("member", memberSchema);