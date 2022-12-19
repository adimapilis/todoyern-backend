const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (!authHeader) return res.status(401).json({message :"No authheader"})
  const token = authHeader.split(' ')[1]
  jwt.verify( 
    token, 
    process.env.ACCESS_TOKEN_SECRET,
    (err, decoded) => {
      if (err) {
        return res.status(403).send({message:"Login or Refresh Access"})
      }
      req.username = decoded.UserInfo.username;
      req.roles = decoded.UserInfo.roles;
      console.log(`Access granted to: ${req.username} ${req.roles}`)
      next()
    }
  )
}

module.exports = verifyJWT