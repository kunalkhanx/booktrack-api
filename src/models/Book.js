const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 255,
        unique: true
    },
    authors: {
        type: Array,
        required: true
    },
    description: {
        type: String,
        required: false,
        maxLength: 5000,
        default: null
    },
    cover: {
        type: String,
        required: false,
        default: null
    },
    genres: {
        type: Array,
        required: true
    },
    pages: {
        type: Number,
        required: false,
        default: null
    },
    published_on:{
        type: Date,
        required: false,
        default: null
    },
    isbn: {
        type: Array,
        required: false,
        default: []
    }
}, {timestamps: true})

const Book = mongoose.model('Book', schema)
module.exports = Book