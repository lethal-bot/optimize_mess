const mongoose = require('mongoose');


const messSchema = mongoose.Schema({
    messname: {
        type: String,
        required: true,
        trim: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    members: [{
        member: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }]
})

const Mess = mongoose.model('Mess', messSchema);

module.exports = Mess;