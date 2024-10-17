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

const Genre = new mongoose.model('Genre', schema)
module.exports = Genre