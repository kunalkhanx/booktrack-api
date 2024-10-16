const express = require('express')
const auth = require('./app/auth.routes')
const profile = require('./app/profile.routes')
const book = require('../src/app/book.routes')
const author = require('../src/app/author.routes')

const router = express.Router()

router.use('/auth', auth)                   // Auth Routes
router.use('/profile', profile)             // Profile routes
router.use('/book', book)                   // Profile routes
router.use('/author', author)               // Author routes

module.exports = router