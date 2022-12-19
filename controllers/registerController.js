const User = require('../models/userModel')
const Note = require('../models/noteModel')
const bcrypt = require('bcrypt')
const asyncHandler = require('express-async-handler')

const handleNewUser = asyncHandler (async (req,res) => {
  const { username, password } = req.body
  let roles = req.body.roles
  // data validation
  if (!username || !password) {
    console.log("bano")
    return res.status(400).json({message: 'All fields are required'})
  }

  if (!roles) roles = ["user"]
  // check for duplicate
  const duplicate = await User.findOne({username}).lean().exec()
  
  if (duplicate) {
    return res.status(400).json({message: "Username Already taken"})
  }

  console.log("lagpas")
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create and store new user
  const userObject = { username, "password": hashedPassword, roles }
  const user = await User.create(userObject)

  if (user) {
    res.status(200).json({ message: `New user ${username} created`})
  }
  else {
    res.status(400).json({message: 'Invalid data received'})
  }   
})

module.exports = { handleNewUser }