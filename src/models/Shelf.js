const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 100
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    protected: {
        type: Boolean,
        default: false
    },
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    }],
    status: {
        type: Number,
        default: 1
    }
}, {timestamps: true})

schema.methods.getBooks = async function(query = {}, limit = 500, skip = 0){
    const shelf = this
    const Book = require('./Book')
    const books = await Book.find({...query, status: 1, _id: shelf.books}).skip(skip).limit(limit)
    return books
}

const Shelf = mongoose.model('Shelf', schema)
module.exports = Shelf