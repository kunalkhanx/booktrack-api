const Case = require('case')
const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 50,
        unique: true
    },
    status: {
        type: Number,
        default: 1
    }
}, {timestamps: true})

schema.pre('save', async function(next){
    const genre = this
    genre.name = Case.title(genre.name.toLowerCase())
    return next()
})

schema.methods.getBooks = async function(){
    const genre = this;
    const Book = require('./Book')
    const books = await Book.find({genres: genre._id, status: 1})
    return books
}

const Genre = mongoose.model('Genre', schema)
module.exports = Genre