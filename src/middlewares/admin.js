const debug = require('../utils/debug')

const admin = async (req, res, next) => {
    try{
        if(req.user.role === 'ADMIN'){
            next()
            return
        }
        throw new Error();
    }catch(e){
        debug.error(e)
        return res.status(401).json({
            code: 401,
            message: e._message ? e._message : 'Required failed!'
        })
    }

}

module.exports = admin