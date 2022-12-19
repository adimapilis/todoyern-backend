const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const asyncHandler = require('express-async-handler')

const handleLogin = asyncHandler (async (req,res) => {
  const { username, password } = req.body
  
  // data validation
  if (!username || !password ) {
    return res.status(400).json({message: 'All fields are required'})
  }

  // check for duplicate
  const foundUser = await User.findOne({username})
  if (!foundUser) {
    return res.status(400).json({message: "Cannot find user"})
  }

  // evaluate password
  const match = await bcrypt.compare(password, foundUser.password)
  if (match) {
    // create JWT
    const accessToken = jwt.sign(
      { "UserInfo" : {
          "username": foundUser.username,
          "roles": foundUser.roles
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn:'900s'}
      )
    const refreshToken = jwt.sign(
      {"username": foundUser.username},
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn:'1d'}
      )
    foundUser.refreshToken = refreshToken
    const updatedUser = await foundUser.save()
    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', maxAge: 24*60*60*1000 })// secure: true,
    res.json({ accessToken, roles:foundUser.roles })
  } else {
    return res.status(400).json({message: "Wrong Password"})//401
  }
})

module.exports = { handleLogin }