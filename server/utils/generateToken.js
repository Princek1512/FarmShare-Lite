import jwt from 'jsonwebtoken'

export function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'farmshare_railway_jwt_secret_key_2024_secure'
  return jwt.sign(
    { id: user.id, role: user.role },
    secret,
    { expiresIn: '7d' }
  )
}