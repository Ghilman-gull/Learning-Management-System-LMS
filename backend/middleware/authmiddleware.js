const jwt = require('jsonwebtoken')
const Teacher = require('../model/Teacher')

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' })
    }

    const teacher = await Teacher.findById(decoded.id)
    if (!teacher) {
      return res.status(401).json({ message: 'User not found' })
    }

    if (teacher.status !== 'APPROVED') {
      return res.status(403).json({
        message: 'Access denied: Your account is not approved yet'
      })
    }

    req.user = teacher 
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
