const User = require('../models/userModel')
const Note = require('../models/noteModel')

const jwt = require('jsonwebtoken')
require('dotenv').config()
const asyncHandler = require('express-async-handler')

const handleRefreshToken = asyncHandler (async  (req,res) => {
  const cookies = req.cookies
  
  // data validation
  if (!cookies?.jwt) {
    return res.status(401).json({message: 'No Cookies Received'})
  }

  const refreshToken = cookies.jwt
  
  // check existing token in DB
  const foundUser = await User.findOne({refreshToken: refreshToken})
  if (!foundUser) {
    return res.status(400).json({message: "Cannot find user"})
  }

  // evaluate jwt
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, decoded) => {
      if (err || foundUser.username !==decoded.username) return res.status(400).json({message: "Unauthorized"})
      const roles = foundUser.roles
      const accessToken = jwt.sign(
        { "UserInfo" : {
            "username":decoded.username,
            "roles":  roles
        }},
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '900s'}
      )
      res.json({accessToken})
    }
  )
})

module.exports = { handleRefreshToken }