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

const Shelf = mongoose.model('Shelf', schema)
module.exports = Shelf