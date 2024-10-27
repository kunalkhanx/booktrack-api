const express = require('express')
const Joi = require('joi')
const auth = require('../middlewares/auth')
const Book = require('../models/Book')
const Note = require('../models/Note')
const NoteComment = require('../models/NoteComment')
const debug = require('../utils/debug');

const router = express.Router()


router.post('/comment/:note', auth, async (req, res) => {
    try{

        const schema = Joi.object({
            body: Joi.string().required().max(1000)
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

        const note = await Note.findOne({_id: req.params.note, $or: [{user: req.user._id}, {is_public: true}]})
        if(!note){
            return res.status(404).json({
                code: 404,
                message: 'Note not found'
            })
        }

        const comment = new NoteComment({...result.value, user: req.user._id, note: note._id})
        await comment.save()

        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: comment
        }) 


    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

router.patch('/comment/:comment', auth, async (req, res) => {
    try{

        const schema = Joi.object({
            body: Joi.string().required().max(1000)
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

        const comment = await NoteComment.findOne({user: req.user._id, _id: req.params.comment})
        if(!comment){
            return res.status(404).json({
                code: 404,
                message: 'Comment not found'
            })
        }
        comment.body = result.value.body
        await comment.save()

        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: comment
        }) 


    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

router.delete('/comment/:comment', auth, async (req, res) => {
    try{

        const comment = await NoteComment.findOne({user: req.user._id, _id: req.params.comment})
        if(!comment){
            return res.status(404).json({
                code: 404,
                message: 'Comment not found'
            })
        }
        await NoteComment.deleteOne({_id: comment._id})

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

        const notes = await Note.find(query).skip(skip).limit(limit).sort(sort)

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

        const note = await Note.findOne({_id: req.params.note, $or: [{user: req.user._id}, {is_public: true}]})
        if(!note){
            return res.status(404).json({
                code: 404,
                message: 'Note not found'
            })
        }

        const comments = await NoteComment.find({note: note._id})

        return res.status(200).json({
            code: 200,
            message: 'Request Complete!',
            data: {note, comments}
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

router.patch('/:note', auth, async (req, res) => {
    try{

        const schema = Joi.object({
            title: Joi.string().optional().max(160),
            body: Joi.string().optional().max(5000),
            is_public: Joi.boolean().optional()
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

        const note = await Note.findOne({_id: req.params.note, user: req.user._id})
        if(!note){
            return res.status(404).json({
                code: 404,
                message: 'Note not found'
            })
        }

        for(let i in result.value){
            note[i] = result.value[i]
        }

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

router.delete('/:note', auth, async (req, res) => {
    try{

        const note = await Note.findOne({_id: req.params.note, user: req.user._id})
        if(!note){
            return res.status(404).json({
                code: 404,
                message: 'Note not found'
            })
        }

        await Note.deleteOne({_id: note._id})

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