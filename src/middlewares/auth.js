const jwt = require('jsonwebtoken')
const debug = require('../utils/debug')
const User = require('../models/User')
const Token = require('../models/Token')

const auth = async (req, res, next) => {
    try{
        const _token = req.headers.authorization.replace('Bearer ', '')
        if(!_token){
            throw new Error('Unauthorized access!')
        }
        const payload = jwt.verify(_token, process.env.APP_KEY)
        const token = await Token.findOne({token: _token})
        if(!token){
            throw new Error('Unauthorized access!')
        }
        const user = await User.findOne({email: payload.email, status: {$gt: 0}})
        if(!user || !token.reference.includes(user._id)){
            throw new Error('Unauthorized access!')
        }
        req.user = user
        next()
    }catch(e){
        debug.error(e)
        return res.status(401).json({
            code: 401,
            message: e._message ? e._message : 'Required failed!'
        })
    }

}

module.exports = auth