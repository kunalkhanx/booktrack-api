const express = require('express')
const Joi = require('joi')
const auth = require('../middlewares/auth')
const Author = require('../models/Author')
const debug = require('../utils/debug')

const router = express.Router()


router.post('/', auth, async (req, res) => {
    try{

        const schema = Joi.object({
            name: Joi.string().required().max(160)
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

        const author = new Author(result.value)
        await author.save()

        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: author
        })

    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

router.patch('/:author', auth, async (req, res) => {
    try{

        const schema = Joi.object({
            name: Joi.string().required().max(160)
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

        const author = await Author.findById(req.params.author)
        if(!author){
            return res.status(404).json({
                code: 404,
                message: 'Author not found'
            })
        }
        author.name = result.value.name
        await author.save()
        
        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: author
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