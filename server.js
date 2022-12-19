require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const verifyJWT = require('./middleware/verifyJWT')
const PORT = process.env.PORT || 3500


// connect to Mongo DB
connectDB()

//
app.use((req,res, next)=> {
  console.log(req.method, req.url)
  next()
})


// allows browser handling local api
app.use(cors(corsOptions))

// allows handling urlencoded form data 
app.use(express.urlencoded({ extended: false}))

// allows receiving and parsing json 
app.use(express.json())

// allows receiving and parsing cookie
app.use(cookieParser())

// telling express where to find static files
app.use('/', express.static(path.join(__dirname,'public')))

// imports routes in the routes folder
app.use('/', require('./routes/root'))

//  requires username and password in req.body
//  returns message thru res.json
app.use('/register', require('./routes/registerRoute'))

//  requires username and password in req.body
//  returns refreshToken in res.cookie
//  returns accessToken in res.json
app.use('/login', require('./routes/authRoute'))

//  requires refreshToken in req.cookies
//  returns accessToken thru res.json if refreshToken is valid
app.use('/refresh', require('./routes/refreshRoute'))

//  requires refreshToken in req.cookies
//  returns message thru json
app.use('/logout', require('./routes/logoutRoute'))

// verify user before further access
//  requires refreshToken in req.authorization or req.Authorization
//  adds username and roles to the req
app.use(verifyJWT)

// handles request for notes
app.use('/notes', require('./routes/noteRoutes'))

// handles request for users
app.use('/users', require('./routes/userRoutes'))


// handles not found routes
app.all('*', (req, res) => {
  res.status(404)
  if (req.accepts('html')){
    res.sendFile(path.join(__dirname, 'views', '404.html'))
  } else if (req.accepts('json')) {
    res.json({message: '404 Not Found'})
  } else {
    res.type('text').send('404 Not Found')
  }

})

// logs connection status
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB')
  app.listen(PORT, ()=>console.log(`server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
  console.log(err)
})