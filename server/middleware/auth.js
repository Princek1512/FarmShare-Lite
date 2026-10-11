import jwt from 'jsonwebtoken'

export function protect(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const secret = process.env.JWT_SECRET || 'farmshare_railway_jwt_secret_key_2024_secure'
    const decoded = jwt.verify(token, secret)
    req.userId = decoded.id
    req.userRole = decoded.role
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid' })
  }
}