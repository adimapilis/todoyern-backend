const User = require('../models/userModel')
const Note = require('../models/noteModel')
const bcrypt = require('bcrypt')
const asyncHandler = require('express-async-handler')


// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const roles = req.roles
  const username = req.username
  let parameter = {username}
  // if role is admin, returns all User
  const admin = roles.includes("admin")
  if (admin) parameter = {}
  console.log(parameter)
  const users = await User.find(parameter).select('-password').lean()

  if (!users?.length) {
    return res.status(400).json({message: "No users found"})
  }
  res.json(users)
})

// @desc Get specific user
// @route GET /users/:id
// @access Private
const getUser = asyncHandler(async (req, res) => {
  const id = req.params.id
  const user = await User.findById({_id:id}).select('-password').lean()
  if (!user) {
    return res.status(400).json({message: "No users found"})
  }
  res.json(user)
})


// @desc Update all user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id
  const origUsername = req.username
  const userRole = req.roles
  const { roles, username, active, newPassword, oldPassword} = req.body
  const admin = userRole.includes("admin")
  const wantToAdmin = roles.includes("admin")

  if (!admin && wantToAdmin) return res.status(401).json({message:"Not authorized to modify role"})

  // data validation
  if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
    return res.status(400).json({message: 'All field are required'})
  }

  const user  = await User.findOne({username:origUsername}).exec()
  const toUpdateuser = await User.findById(id).exec()

  // checks if authorized to modify other user
  if (!admin &&(user._id != id)) return res.status(401).json({message:"Not authorized to modify other user"})

  if (!toUpdateuser) {
    return res.status(400).json({message: "User not found"})
  }

// Check for duplicate
  const duplicate = await User.findOne({username}).lean().exec()
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(400).json({message: "Duplicate username"})
  }

  toUpdateuser.username = username
  toUpdateuser.roles = roles
  toUpdateuser.active = active

  // verify if the user knows the old password
  if (newPassword && oldPassword) {
    const match = await bcrypt.compare(oldPassword, toUpdateuser.password)
    if (!match) return res.status(401).json({message: "Wrong Password"})
    toUpdateuser.password = await bcrypt.hash(newPassword, 10)
  }
  
  // save user
  const updatedUser = await toUpdateuser.save()
  res.json({ message: `${updatedUser.username} updated`})

})

// @desc Delete all user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id
  console.log(id)
  // data validation
  if (!id) {
    return res.status(400).json({message: 'User ID required'})
  }

  // check for existing notes
  const notes = Note.find({user:id}).lean().exec()
  if (notes?.length) {
    return res.status(400).json({message: 'User has assigned notes'})
  }
  
  // delete user
  const user = await User.findById(id).exec()
  if (!user) {
    return res.status(400).json({message : 'User not found'})
  }

  const result = await user.deleteOne()
  res.status(200).json({message: `User ${result.username} with ID ${result.id}`})
})

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser
}