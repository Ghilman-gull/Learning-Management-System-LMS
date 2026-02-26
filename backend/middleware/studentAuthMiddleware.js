const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' })
    }

    req.user = { id: decoded.id }
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
