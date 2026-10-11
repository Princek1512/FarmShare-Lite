import bcrypt from 'bcrypt'
import { findUserByEmail, createUser, findUserById } from '../models/userModel.js'
import { generateToken } from '../utils/generateToken.js'

export async function register(req, res) {
  try {
    const { name, email, phone, password, location } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    const existing = await findUserByEmail(email)
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    // Every self-registered account is a 'farmer' — this single role can
    // both list equipment and rent equipment. 'admin' is never set here;
    // it's only granted by directly updating the database.
    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = await createUser({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'farmer',
      location,
    })
    const user = await findUserById(userId)
    const token = generateToken(user)

    res.status(201).json({ user, token })
  } catch (err) {
    console.error('Registration error:', err)
    res.status(500).json({ message: 'Server error during registration' })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const existing = await findUserByEmail(email)
    if (!existing) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (existing.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked' })
    }

    const isMatch = await bcrypt.compare(password, existing.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = await findUserById(existing.id)
    const token = generateToken(user)

    res.json({ user, token })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error during login' })
  }
}

export async function getMe(req, res) {
  try {
    const user = await findUserById(req.userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ user })
  } catch (err) {
    console.error('getMe error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}
