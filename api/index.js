const app = require("../app")
const connectDB = require("../config/connectDB")
const {setServers} = require("dns/promises")

connectDB()

if (process.env.NODE_ENV !== 'PRODUCTION') {
    const chalk = require('chalk')
    setServers(['8.8.8.8','8.8.4.4'])
    const port = process.env.PORT || 5000
    app.listen(port , () => {
        console.log(chalk.bgGreen(`server is running at port ${port}`));
    })
}



module.exports = app