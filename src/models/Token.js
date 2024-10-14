const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    expire: {
        type: Number,
        required: true
    },
    reference: {
        type: String,
        required: true
    }
}, {timestamps: true})


const Token = mongoose.model('Token', schema)
module.exports = Token