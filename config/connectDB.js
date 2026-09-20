const mongoose = require("mongoose")
const chalk = require('chalk')
const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.PRODUCTION_DATABASE_LINK)
        console.log(chalk.bgBlue(`Database is connected successfully at ${con.connection.name}`));
    } catch (error) {
        console.log(`DatabaseError : ${error}`);
    }
    
}

module.exports = connectDB