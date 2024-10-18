const express = require('express')
const auth = require('./app/auth.routes')
const profile = require('./app/profile.routes')
const book = require('./app/book.routes')
const author = require('./app/author.routes')
const genre = require('./app/genre.routes')
const shelf = require('./app/shelf.routes')

const router = express.Router()

router.use('/auth', auth)                   // Auth Routes
router.use('/profile', profile)             // Profile routes
router.use('/book', book)                   // Profile routes
router.use('/author', author)               // Author routes
router.use('/genre', genre)                 // Genre routes
router.use('/shelf', shelf)                 // Shelf routes

module.exports = router