const express = require('express')
const dotenv = require('dotenv')
const logger = require('./middleware/logger')
const connectDB = require('./config/db')
const router = require('./routes/users')
const bodyParser = require('body-parser')
const auth = require('./routes/auth')
const protect = require('./middleware/auth')
const cookieparser = require('cookie-parser')

// Load env vars
dotenv.config({path:'./config/config.env'})

const app = express();
app.use(logger)
app.use(cookieparser())
app.use('/me', protect)

connectDB(app)

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use('/', router)
app.use('/', auth)

const PORT = process.env.PORT || 5000;


app.listen(PORT, console.log(`Server running on port ${PORT}`));