const Case = require('case')
const mongoose = require('mongoose')

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

const Author = mongoose.model('Author', schema)
module.exports = Author