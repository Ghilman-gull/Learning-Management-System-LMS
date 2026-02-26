const jwt = require('jsonwebtoken')
const Teacher = require('../model/Teacher')

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await Teacher.findById(decoded.id)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    req.admin = user
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
