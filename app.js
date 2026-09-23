require('dotenv').config()
const express = require("express")
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const limiter = require('express-rate-limit')
const {setServers} = require("dns/promises")
const globalError = require('./middlewares/globalError')
const authRouter = require("./Features/auth/auth.route")
const usersRouter = require("./Features/users/users.route")
setServers(['8.8.8.8','8.8.4.4'])

const app = express()
app.set("query parser" , "extended")

const appLimiter = limiter.rateLimit({
    limit : 100 ,
    windowMs : 15 * 60 * 1000
})

const authLimiter = limiter.rateLimit({
    windowMs : 3 * 60 * 1000 ,
    limit : 5
})

app.use(express.json())
app.use(cors({
    origin : "*"
}))
app.use(morgan("dev"))
app.use(helmet())
app.use(appLimiter)
app.use("/auth",authLimiter)

app.get("/" , (req,res) => {
    res.status(200).json({
        success : true ,
        message : `Welcome to server`
    })
})

app.use('/auth',authRouter)
app.use('/users',usersRouter)

app.use((req,res) => {
    res.status(404).json({
        success : false ,
        message : `404 Page not found`
    })
})

app.use(globalError)

module.exports = app