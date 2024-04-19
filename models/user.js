const mongoose = require('mongoose');
const validator = require('validator')
const Mess = require('../models/mess.js')
const jwt = require('jsonwebtoken')
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            for (let i = 0; i < value.length; i++) {
                if (!((value[i] >= 'a' && value[i] <= 'z') || (value[i] >= '0' && value[i] <= '9'))) throw new Error('must contain only small alpha and numbers')
            }
        }
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is inValid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length < 6) {
                throw new Error('length must be greater than 6')
            } else if (value === 'password') {
                throw new Error('password cannot be password')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    requests: [{
        messReq: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }],
    joinedMess: [{
        messId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: Mess
        }
    }]
})

userSchema.virtual('adminMess', {
    ref: 'Mess',
    localField: '_id',
    foreignField: 'admin'
})

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, 'adityaisthebest');
    user.tokens = user.tokens.concat({ token })

    await user.save();
    return token;
}


const User = mongoose.model('User', userSchema);

// const dummy = new User({
//     username: "abcdhbc",
//     name: "aditya",
//     email: "aditya090@gmail.com",
//     password: "aaditya"
// })

// dummy.save()
module.exports = User