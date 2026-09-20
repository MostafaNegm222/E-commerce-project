const app = require("../app")
const connectDB = require("../config/connectDB")

connectDB()

if (process.env.NODE_ENV !== 'PRODUCTION') {
    const chalk = require('chalk')
    const port = process.env.PORT || 5000
    app.listen(port , () => {
        console.log(chalk.bgGreen(`server is running at port ${port}`));
    })
}



module.exports = app