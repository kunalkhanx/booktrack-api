const mongoose = require('mongoose')
const validator = require('validator')
const Case = require('case')
const bcrypt = require('bcryptjs')

const schema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 50,
        trim: true,
        validate: (value) => {
            if(!validator.isAlpha(value)){
                throw new Error('Invalid first name.');
            }
        }
    },
    last_name: {
        type: String,
        maxLength: 50,
        default: null,
        trim: true,
        validate: (value) => {
            if(!validator.isAlpha(value, 'en-US', {ignore: ' '})){
                throw new Error('Invalid last name.');
            }
        }
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        minLength: 4,
        maxLength: 16,
        validate: (value) => {
            if(!validator.isAlphanumeric(value)){
                throw new Error('Invalid username.');
            }
        }
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
        minLength: 5,
        maxLength: 50,
        validate: (value) => {
            if(!validator.isEmail(value)){
                throw new Error('Invalid email address.');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    avatar: {
        type: String,
        default: null
    },
    dob: {
        type: String,
        default: null,
    },
    sex: {
        type: String,
        default: null,
        enum: ['male', 'female', 'others']
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    status: {
        type: Number,
        default: 0
    }
}, {timestamps: true})


schema.pre('save', async function(next){
    const user = this
    user.first_name = Case.title(user.first_name.toLowerCase())
    user.last_name = Case.title(user.last_name.toLowerCase())
    user.username = user.username.toLowerCase()
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password + process.env.APP_KEY, 8)
    }
    return next()
})

schema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = new mongoose.model('User', schema);
module.exports = User