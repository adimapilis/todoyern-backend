const express = require('express')
const router = express.Router()
const verifyRoles= require('../middleware/verifyRoles')
const {  getNote, getAllNotes, createNewNote, updateNote, deleteNote } = require('../controllers/notesController')

router.route('/')
  // returns note/s thru json
  .get(getAllNotes) 

  // requires title and text in req.body
  .post(verifyRoles("user","admin"),createNewNote) 



router.route('/:id')
  // returns specific note thru json
  .get(verifyRoles("user","admin"),getNote) 

  // requires id, title, text, completed in req.body
  .patch(verifyRoles("user","admin"),updateNote)

  // requires id in params
  .delete(verifyRoles("user","admin"),deleteNote)
module.exports = router