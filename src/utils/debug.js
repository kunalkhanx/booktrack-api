const debug = {

    error(message){
        if(process.env.DEBUG_MODE){
            console.error(message)
        }
    },

    log(message){
        if(process.env.DEBUG_MODE){
            console.log(message)
        }
    },

}

module.exports = debug