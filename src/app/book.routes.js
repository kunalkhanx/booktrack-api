const express = require('express')
const Joi = require('joi')
const debug = require('../utils/debug')
const auth = require('../middlewares/auth')
const Author = require('../models/Author')
const Genre = require('../models/Genre')
const Book = require('../models/Book')
const router = express.Router()


router.post('/', auth, async (req, res) => {
    try{

        const schema = Joi.object({
            title: Joi.string().required().max(160),
            authors: Joi.array().required().items(Joi.string()).min(1),
            description: Joi.string().optional().max(500),
            cover: Joi.string().optional(),
            genres: Joi.array().required().items(Joi.string()).min(1),
            pages: Joi.number().optional(),
            published_on: Joi.date().optional(),
            isbn: Joi.array().optional().items(Joi.string())
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

        const authors = []
        for(let author of result.value.authors){
            let authorModel = await Author.findOne({name: { $regex : new RegExp(author.replace(/\s+/g,' ').trim(), "i") }})
            if(!authorModel){
                authorModel = new Author({name: author})
                await authorModel.save()
            }
            authors.push(authorModel)
        }

        const genres = []
        for(let genre of result.value.genres){
            let genreModel = await Genre.findOne({name: { $regex : new RegExp(genre.replace(/\s+/g,' ').trim(), "i") }})
            if(!genreModel){
                genreModel = new Genre({name: genre})
                await genreModel.save()
            }
            genres.push(genreModel)
        }

        const book = new Book({...result.value, authors: authors.map(item => item._id), genres: genres.map(item => item._id)})
        await book.save()


        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: {...book.toJSON(), authors, genres}
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

