const express = require('express')
const auth = require('../middlewares/auth')
const Joi = require('joi')

const router = express.Router()

/**
*    Get logged in user profile
*/
router.get('/', auth, async (req, res) => {
    try{

        return res.status(200).json({
            code: 200,
            message: 'Request Complete!',
            data: req.user
        })

    }catch(e){
        debug.error(e)
        return res.status(500).json({
            code: 500,
            message: e._message ? e._message : 'Required failed!'
        })
    }
})

/**
*    Update logged in user profile
*/
router.patch('/', auth, async (req, res) => {
    try{

        const schema = Joi.object({
            first_name: Joi.string().optional().regex(/^[A-Za-z]+$/).min(2).max(50).messages({'string.pattern.base': 'First name should contain only alphabets' }),
            last_name: Joi.string().optional().regex(/^[A-Za-z\s]+$/).max(50).messages({'string.pattern.base': 'Last name should contain only alphabets & spaces' }),
            email: Joi.string().optional().email().min(4).max(50),
            password: Joi.string().optional().min(8),
            sex: Joi.string().optional().valid('male', 'female', 'others'),
            dob: Joi.date().optional()
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

        const user = req.user
        for(let i in result.value){
            user[i] = result.value[i]
        }
        await user.save()

        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: user
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