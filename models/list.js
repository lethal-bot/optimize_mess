const mongoose = require('mongoose')
const User = require('../models/user')
const listSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,

    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    edited: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Edit
    },
    editedFlag: {
        type: Boolean,
        default: false,
    }

})

const List = mongoose.model('List', listSchema);

module.exports = List;