const express = require('express')
const Joi = require('joi')
const auth = require('../middlewares/auth')
const Genre = require('../models/Genre')
const debug = require('../utils/debug')
const admin = require('../middlewares/admin')

const router = express.Router()

router.get('/', auth, async (req, res) => {
    try{

        const query = {status: {$gt: 0}}

        if(req.query.status !== undefined){
            query.status = req.query.status
        }

        if(req.query.search){
            query.name = {$regex: new RegExp(req.query.search, 'i')}
        }

        const limit = req.query.limit ? req.query.limit : 500;
        const skip = req.query.skip ? req.query.skip : 0;

        if(limit > 500){
            return res.status(400).json({
                code: 400,
                message: 'Query limit can\'t be more then 500'
            })
        }

        const genres = await Genre.find(query).skip(skip).limit(limit)

        return res.status(200).json({
            code: 200,
            message: 'Request Complete!',
            data: genres
        })

    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

router.get('/:genre', auth, async (req, res) => {
    try{
        const genre = await Genre.findById(req.params.genre)
        if(!genre){
            return res.status(404).json({
                code: 404,
                message: 'Genre not found'
            })
        }
        
        const books = await genre.getBooks()

        return res.status(200).json({
            code: 200,
            message: 'Request Complete!',
            data: {...genre.toJSON(), books}
        })

    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

router.post('/', auth, admin, async (req, res) => {
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

        const existing = await Genre.findOne({name: { $regex : new RegExp(result.value.name.replace(/\s+/g,' ').trim(), "i") }})
        if(existing){
            return res.status(400).json({
                code: 400,
                message: 'Invalid input(s)',
                data: 'Genre name is already exists!'
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

router.patch('/:genre', auth, admin, async (req, res) => {
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

        const genre = await Genre.findById(req.params.genre)
        if(!genre){
            return res.status(404).json({
                code: 404,
                message: 'Genre not found'
            })
        }

        genre.name = result.value.name
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

router.delete('/:genre', auth, admin, async (req, res) => {
    try{
        const genre = await Genre.findById(req.params.genre)
        if(!genre){
            return res.status(404).json({
                code: 404,
                message: 'Genre not found'
            })
        }
        genre.status = -1;
        await genre.save()
        return res.status(200).json({
            code: 200,
            message: 'Request Complete!'
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