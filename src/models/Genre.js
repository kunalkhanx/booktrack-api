const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 50,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    }
}, {timestamps: true})

const Genre = new mongoose.Model('Genre', Genre)
module.exports = Genre