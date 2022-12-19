const express = require('express')
const router = express.Router()
const {  getAllUsers, getUser, updateUser, deleteUser } = require('../controllers/usersController')
const verifyRoles = require('../middleware/verifyRoles')

router.route('/')
  // gets allUsers if admin, get own User if just user
  .get(verifyRoles("admin","user"),getAllUsers)
  // .get(verifyRoles("admin","user"), getAllUsers)

// requires the user's id using params
router.route('/:id')
  // gets specific user 
  .get(verifyRoles("admin"), getUser)

    // requires roles, username and active  in req.body
  // optional oldPassword, newPassword in req.body
  .patch(verifyRoles("admin","user"),updateUser)

  // delete user
  .delete(verifyRoles("admin","user"),deleteUser)

module.exports = router