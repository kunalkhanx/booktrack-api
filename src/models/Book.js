const mongoose = require('mongoose')
const Author = require('./Author')
const Genre = require('./Genre')

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
    },
    status: {
        type: Number,
        default: 1
    }
}, {timestamps: true})

schema.methods.getAuthors = async function() {
    const book = this
    const authors = await Author.find({_id: {$in: book.authors}})
    return authors
}

schema.methods.getGenres = async function() {
    const book = this
    const genres = await Genre.find({_id: {$in: book.genres}})
    return genres
}

const Book = mongoose.model('Book', schema)
module.exports = Book