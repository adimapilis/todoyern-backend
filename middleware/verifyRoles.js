const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    console.log(req.roles)
    if (!req?.roles) return res.sendStatus(401)
    const rolesArray = [...allowedRoles]
    const result = req.roles.map(role => rolesArray.includes(role)).find(val => val==true)
    if (!result) {
      console.log(`User Role: ${req.roles}, Required Role:${rolesArray}`)
      return res.status(401).json({message:"Invalid Role"})
    }
    console.log("Role access granted")
    next()
  }
}

module.exports = verifyRoles