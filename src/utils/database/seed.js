const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('./database')
mongoose.connect(process.env.DB_PATH)
const Habit = require("../../models/Habit")

const run = async () => {

    const habit = new Habit({
        name: 'Read Books',
        description: 'Read 20 pages a day',
        user: '67016dec00a97a638e978bcb',
        target_unit: 'Pages(s)',
        target: 20
    })
    await habit.save()

}

run()