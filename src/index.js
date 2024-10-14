const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors')
dotenv.config();

const mongoose = require('./utils/database/database')
mongoose.connect(process.env.DB_PATH)

const routes = require('./routes')

const app = express()

app.use(cors())

app.use(express.json());

app.use('/api/v1', routes)

app.listen(process.env.PORT || 8080, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`)
})