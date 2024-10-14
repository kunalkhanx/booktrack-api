const express = require('express')
const auth = require('./app/auth.routes')
const profile = require('./app/profile.routes')

const router = express.Router()

router.use('/auth', auth)                   // Auth Routes
router.use('/profile', profile)             // Profile routes

module.exports = router