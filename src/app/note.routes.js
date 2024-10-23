const express = require('express')
const auth = require('../middlewares/auth')
const Book = require('../models/Book')
const Joi = require('joi')
const Note = require('../models/Note')

const router = express.Router()


router.get('/', auth, async (req, res) => {
    try{

        const query = {status: {$gt: 0}}

        if(req.query.status !== undefined){
            query.status = req.query.status
        }

        if(req.query.book){
            query.book = req.query.book
        }

        if(req.query.is_public){
            query.is_public = true
        }else{
            query.user = req.user._id
        }

        if(req.query.search){
            query.title = {$regex: new RegExp(req.query.search, 'i')}
        }
        
        const limit = req.query.limit ? req.query.limit : 500;
        const skip = req.query.skip ? req.query.skip : 0;
        
        if(limit > 500){
            return res.status(400).json({
                code: 400,
                message: 'Query limit can\'t be more then 500'
            })
        }

        const notes = await Note.find(query).skip(skip).limit(limit)

        return res.status(200).json({
            code: 200,
            message: 'Request Complete!',
            data: notes
        })

    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

router.get('/:note', auth, async (req, res) => {
    try{

        const note = await Note.findById(req.params.note)
        if(!note){
            return res.status(404).json({
                code: 404,
                message: 'Note not found'
            })
        }

        return res.status(200).json({
            code: 200,
            message: 'Request Complete!',
            data: note
        })


    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

router.post('/:book', auth, async (req, res) => {
    try{

        const schema = Joi.object({
            title: Joi.string().required().max(160),
            body: Joi.string().optional().max(5000),
            is_public: Joi.boolean().default(false)
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

        const note = new Note({...result.value, book: book._id, user: req.user._id})
        await note.save()

        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: note
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