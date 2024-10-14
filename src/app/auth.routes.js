const express = require('express');
const User = require('../models/User');
const Joi = require('joi');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const Token = require('../models/Token');
const debug = require('../utils/debug');

const router = express.Router()

/**
*    Register new user
*/
router.post('/register', async (req, res) => {
    try{

        const schema = Joi.object({
            first_name: Joi.string().required().regex(/^[A-Za-z]+$/).min(2).max(50).messages({'string.pattern.base': 'First name should contain only alphabets' }),
            last_name: Joi.string().optional().regex(/^[A-Za-z\s]+$/).max(50).messages({'string.pattern.base': 'Last name should contain only alphabets & spaces' }),
            username: Joi.string().required().alphanum().min(4).max(16),
            email: Joi.string().required().email().min(4).max(50),
            password: Joi.string().required().min(8),
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

        const user = new User({...result.value, status: 1})
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
});

/**
*    Login existing user
*/
router.post('/login', async (req, res) => {
    try{
        const schema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required()
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

        const user = await User.findOne({email: result.value.email, status: {$gt: 0}})

        if(!user){
            return res.status(401).json({
                code: 401,
                message: 'Invalid email or password!'
            })
        }

        const isPasswordMatch = await bcrypt.compare(result.value.password + process.env.APP_KEY, user.password)

        if(!isPasswordMatch){
            return res.status(401).json({
                code: 401,
                message: 'Invalid email or password!'
            })
        }

        const expire = parseInt(process.env.AUTH_DURATION)

        const jwt_token = jwt.sign({
            email: user.email,
        }, process.env.APP_KEY, {expiresIn: expire})

        const token = new Token({token: jwt_token, expire, reference: `USER_LOGIN:${user.id}`})
        await token.save()

        return res.status(201).json({
            code: 201,
            message: 'Request Complete!',
            data: user,
            token
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