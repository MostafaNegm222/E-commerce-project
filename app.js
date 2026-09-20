require('dotenv').config()
const express = require("express")
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const limiter = require('express-rate-limit')
const {setServers} = require("dns/promises")
setServers(['8.8.8.8','8.8.4.4'])

const app = express()
app.set("query parser" , "extended")


app.use(express.json())
app.use(cors({
    origin : "*"
}))
app.use(morgan("dev"))
app.use(helmet())

const appLimiter = limiter.rateLimit({
    limit : 100 ,
    windowMs : 15 * 60 * 1000
})

app.use(appLimiter)


app.get("/" , (req,res) => {
    res.status(200).json({
        success : true ,
        message : `Welcome to server`
    })
})




app.use((req,res) => {
    res.status(404).json({
        success : false ,
        message : `404 Page not found`
    })
})





module.exports = app