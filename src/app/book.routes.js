const express = require('express')
const Joi = require('joi')
const debug = require('../utils/debug')
const auth = require('../middlewares/auth')
const Author = require('../models/Author')
const Genre = require('../models/Genre')
const Book = require('../models/Book')
const admin = require('../middlewares/admin')
const router = express.Router()


router.get('/', auth, async (req, res) => {
    try{

        const query = {status: {$gt: 0}}

        if(req.query.status !== undefined){
            query.status = req.query.status
        }

        if(req.query.author){
            query.authors = req.query.author
        }

        if(req.query.genres){
            query.genres = {$in: req.query.genres}
        }

        if(req.query.search){
            query.title = {$regex: new RegExp(req.query.search, 'i')}
        }
        let sort = {createdAt: -1}
        if(req.query.sort){
            if(req.query.sort === 'recent'){
                sort = {createdAt: -1}
            }else if(req.query.sort === 'oldest'){
                sort = {createdAt: 1}
            }else if(req.query.sort === 'title'){
                sort = {title: 1}
            }else if(req.query.sort === 'title:desc'){
                sort = {title: -1}
            }
        }
        
        const limit = req.query.limit ? req.query.limit : 500;
        const skip = req.query.skip ? req.query.skip : 0;
        
        if(limit > 500){
            return res.status(400).json({
                code: 400,
                message: 'Query limit can\'t be more then 500'
            })
        }

        const books = await Book.find(query).skip(skip).limit(limit).sort(sort)

        return res.status(200).json({
            code: 200,
            message: 'Request Complete!',
            data: books
        })

    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

router.get('/:book', auth, async (req, res) => {
    try{
        const book = await Book.findById(req.params.book)
        if(!book){
            return res.status(404).json({
                code: 404,
                message: 'Book not found'
            })
        }
        const authors = await book.getAuthors()
        const genres = await book.getGenres()

        return res.status(200).json({
            code: 200,
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

router.post('/', auth, admin, async (req, res) => {
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

        const existing = await Book.findOne({title: { $regex : new RegExp(result.value.title.replace(/\s+/g,' ').trim(), "i") }})
        if(existing){
            return res.status(400).json({
                code: 400,
                message: 'Invalid input(s)',
                data: 'Book title is already exists!'
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

router.patch('/:book', auth, admin, async (req, res) => {
    try{

        const schema = Joi.object({
            title: Joi.string().optional().max(160),
            authors: Joi.array().optional().items(Joi.string()).min(1),
            description: Joi.string().optional().max(500),
            cover: Joi.string().optional(),
            genres: Joi.array().optional().items(Joi.string()).min(1),
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

        const book = await Book.findById(req.params.book)
        if(!book){
            return res.status(404).json({
                code: 404,
                message: 'Book not found'
            })
        }

        const authors = []
        if(result.value.authors){
            for(let author of result.value.authors){
                let authorModel = await Author.findOne({name: { $regex : new RegExp(author.replace(/\s+/g,' ').trim(), "i") }})
                if(!authorModel){
                    authorModel = new Author({name: author})
                    await authorModel.save()
                }
                authors.push(authorModel)
            }
        }

        const genres = []
        if(result.value.genres){
            for(let genre of result.value.genres){
                let genreModel = await Genre.findOne({name: { $regex : new RegExp(genre.replace(/\s+/g,' ').trim(), "i") }})
                if(!genreModel){
                    genreModel = new Genre({name: genre})
                    await genreModel.save()
                }
                genres.push(genreModel)
            }
        }

        for(let i in result.value){
            if(i === 'authors'){
                console.log(result.value.authors)
                book[i] = authors.map(item => item._id)
                continue
            }
            if(i === 'genres'){
                book[i] = genres.map(item => item._id)
                continue
            }
            book[i] = result.value[i]
        }
        await book.save()

        const bookAuthors = await book.getAuthors()
        const bookGenres = await book.getGenres()
        
        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: {...book.toJSON(), authors: bookAuthors, genres: bookGenres}
        })

    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

router.delete('/:book', auth, admin, async (req, res) => {
    try{
        const book = await Book.findById(req.params.book)
        if(!book){
            return res.status(404).json({
                code: 404,
                message: 'Book not found'
            })
        }
        if(book.status > -1){
            book.status = -1
            await book.save()
            return res.status(200).json({
                code: 200,
                message: 'Book moved to trash'
            })
        }
        await Book.deleteOne({_id: book._id})
        return res.status(200).json({
            code: 200,
            message: 'Book deleted successfully'
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

