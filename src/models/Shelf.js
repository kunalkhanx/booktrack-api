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
    allow_delete: {
        type: Boolean,
        default: true
    },
    status: {
        type: Number,
        default: 1
    }
})

const Shelf = mongoose.model('Shelf', schema)
module.exports = Shelf