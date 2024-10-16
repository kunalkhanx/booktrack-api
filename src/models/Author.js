const Case = require('case')
const mongoose = require('mongoose')
const Book = require('./Book')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxLength: 160
    },
    status: {
        type: Number,
        default: 1
    }
}, {timestamps: true})

schema.pre('save', async function(next){
    const author = this
    author.name = Case.title(author.name.toLowerCase())
    return next()
})

schema.methods.getBooks = async function() {
    const author = this
    const books = await Book.find({authors: author._id, status: 1})
    return books
}

const Author = mongoose.model('Author', schema)
module.exports = Author