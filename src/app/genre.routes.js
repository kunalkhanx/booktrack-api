const express = require('express')
const Joi = require('joi')
const auth = require('../middlewares/auth')
const Genre = require('../models/Genre')
const debug = require('../utils/debug')

const router = express.Router()

router.post('/', auth, async (req, res) => {
    try{

        const schema = Joi.object({
            name: Joi.string().required().max(50)
        })

        const result = schema.validate(req.body)
        if(result.error){
            const message = result.error.details[0].message
            return res.status(400).json({
                code: 400,
                message: 'Invalid input(s)',
                data: message
            })
        }

        const genre = new Genre(result.value)
        await genre.save()

        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: genre
        })

    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

module.exports = router