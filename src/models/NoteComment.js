const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    body: {
        type: String,
        required: true,
        maxLength: 1000
    },
    status: {
        type: Number,
        default: 1
    }
}, {timestamps: true})

const NoteComment = mongoose.model('NoteComment', schema)
module.exports = NoteComment