const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxLength: 160
    }
}, {timestamps: true})

const Author = mongoose.model('Author', schema)
module.exports = Author