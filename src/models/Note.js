const mongoose = require('mongoose')

const schema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        maxLength: 255
    },
    body: {
        type: String,
        required: false,
        maxLength: 5000
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Book'
    },
    is_public: {
        type: Boolean,
        default: false
    },
    status: {
        type: Number,
        default: 1
    }

}, {timestamps: true})

const Note = mongoose.model('Note', schema)
module.exports = Note