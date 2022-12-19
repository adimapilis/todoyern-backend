const User = require('../models/userModel')

const asyncHandler = require('express-async-handler')

const handleLogout = asyncHandler (async  (req,res) => {
  const cookies = req.cookies
  console.log(cookies)
  // data validation
  if (!cookies?.jwt) {
    return res.status(401).json({message: 'No Cookies Received'})
  }

  const refreshToken = cookies.jwt
  
  // is refreshtoken in database
  const foundUser = await User.findOne({refreshToken: refreshToken})
  if (!foundUser) {
    res.clearCookie('jwt', { httpOnly: true})
    return res.status(400).json({message: "Cannot find user"})
  }

  // Delete refreshToken in db
  foundUser.refreshToken = ""
  const updatedUser = await foundUser.save()
  res.clearCookie('jwt', { httpOnly: true} ) //secure : true - only serves https
  res.status(204).json({message:"refreshToken Revoked"})
})

module.exports = { handleLogout }