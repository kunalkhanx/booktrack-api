const express = require('express')
const Joi = require('joi')
const auth = require('../middlewares/auth')
const debug = require('../utils/debug')
const Shelf = require('../models/Shelf')

const router = express.Router()


router.get('/', auth, async (req, res) => {
    try{

        const query = {status: {$gt: 0}, user: req.user._id}

        if(req.query.status !== undefined){
            query.status = req.query.status
        }

        if(req.query.search){
            query.title = {$regex: new RegExp(req.query.search, 'i')}
        }

        const shelfs = await Shelf.find(query)

        return res.status(200).json({
            code: 200,
            message: 'Request Complete!',
            data: shelfs
        })

    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

router.get('/:shelf', auth, async (req, res) => {
    try{

        const shelf = await Shelf.findById(req.params.shelf)
        if(!shelf){
            return res.status(404).json({
                code: 404,
                message: 'Shelf not found'
            })
        }

        return res.status(200).json({
            code: 200,
            message: 'Request Complete!',
            data: shelf
        })

    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

router.post('/', auth, async (req, res) => {

    try{
        const schema = Joi.object({
            name: Joi.string().required().max(100)
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
    
        const shelf = new Shelf({name: result.value.name, user: req.user._id})
        await shelf.save()

        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: shelf
        })

    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }

})

router.post('/:shelf/book', auth, async (req, res) => {
    try{

        const schema = Joi.object({
            books: Joi.array().required().items(Joi.string()).min(1),
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

        const shelf = await Shelf.findById(req.params.shelf)
        if(!shelf){
            return res.status(404).json({
                code: 404,
                message: 'Shelf not found'
            })
        }

        const books = [...new Set([...shelf.books.map(book => book.toString()), ...result.value.books])]
        shelf.books = books
        await shelf.save()

        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: shelf
        })


    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})


router.patch('/:shelf', auth, async (req, res) => {

    try{
        const schema = Joi.object({
            name: Joi.string().required().max(100)
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
    
        const shelf = await Shelf.findById(req.params.shelf)
        if(!shelf){
            return res.status(404).json({
                code: 404,
                message: 'Shelf not found'
            })
        }
        if(shelf.protected){
            return res.status(404).json({
                code: 404,
                message: 'Shelf is not editable.'
            })
        }
        shelf.name = result.value.name
        await shelf.save()

        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: shelf
        })

    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }

})

router.delete('/:shelf', auth, async (req, res) => {
    try{

        const shelf = await Shelf.find({_id: req.params.shelf, user: req.user._id, protected: false})
        if(!shelf){
            return res.status(404).json({
                code: 404,
                message: 'Shelf not found'
            })
        }

        await Shelf.deleteOne({_id: req.params.shelf})

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