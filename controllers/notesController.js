const User = require('../models/userModel')
const Note = require('../models/noteModel')
const bcrypt = require('bcrypt')
const asyncHandler = require('express-async-handler')


// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  console.log("getAllNotes")
  const username = req.username
  const role = req.roles
  const admin = role.includes("admin")

  
  // gets the user data
  const user = await User.findOne({username}).lean().exec()

  let filter = {user: user._id}
  if (admin) filter = {}
  
  // gets all Notes linked with the user
  const notes = await Note.find(filter).lean().exec()

  if (!notes?.length) {
    return res.status(400).json({message: "No notes found"})
  }
  res.json(notes)
})

// @desc Get specific notes
// @route GET /notes
// @access Private
const getNote = asyncHandler(async (req, res) => {
  const username = req.username
  const id = req.params.id
  const role = req.roles
  const admin = role.includes("admin")

  // gets the user data
  const user = await User.findOne({username}).lean().exec()

  let filter = {_id:id,user: user._id}
  if (admin) filter = {_id:id}

  // gets Note by ID
  const notes = await Note.find(filter).lean()
  if (!notes?.length) {
    return res.status(400).json({message: "No notes found"})
  }
  res.json(notes)
})

// @desc Create new notes
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
  const username = req.username
  const { title, text } = req.body
  
  // gets the user data
  const user = await User.findOne({username}).lean().exec()

  // data validation
  if ( !title || !text ) {
    return res.status(400).json({message: 'All fields are required'})
  }

  // check for duplicate
  const duplicate = await Note.findOne({title}).lean().exec()
  if (duplicate) {
    return res.status(400).json({message: "Title already exists"})
  }

  // Create and store new notes
  const note = await Note.create({ user:user._id, title, text })
  if (note) {
    res.status(200).json({ message: `New note with title ${title} is created`})
  }
  else {
    res.status(400).json({message: 'Invalid data received'})
  }  
})

// @desc Update all notes
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const username = req.username
  const id = req.params.id
  const { title, text, completed } = req.body
  const role = req.roles
  const admin = role.includes("admin")

  console.log(title,text,completed)
  // data validation
  if (!id || !title || !text || typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'All fields are required' })
  }

  // gets the user data
  const user = await User.findOne({username}).exec()

  let filter = {_id:id,user: user._id}
  if (admin) filter = {_id:id}


  const note = await Note.findOne({_id:id, user:user._id}).exec()
  if (!note) {
    return res.status(400).json({message: "Note not found"})
  }

// Check for duplicate
  const duplicate = await Note.findOne(filter).lean().exec()

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(400).json({ message: 'Duplicate note title' })
  }

  note.user = user
  note.title = title
  note.text = text
  note.completed = completed
  
  const updatedNote = await note.save()
  res.json({ message: `${updatedNote.title} updated`})

})

// @desc Delete all notes
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const username = req.username
  const id = req.params.id
  const role = req.roles
  const admin = role.includes("admin")

  // data validation
  if (!id) {
    return res.status(400).json({message: 'Note ID required'})
  }
  // gets the user data
  const user = await User.findOne({username}).exec()

  let filter = {_id:id, user:user.id}
  if (admin) filter = {_id:id}

  // check for existing notes
  const note = await Note.findOne(filter).exec()

  if (!note) {
    return res.status(400).json({message: 'Note not found'})
  }

  const result = await note.deleteOne()
  res.status(200).json({message: `Note with Title ${result.title} and ID ${result.id} is deleted`})
})

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
  getNote
}