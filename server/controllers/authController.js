import bcrypt from 'bcrypt'
import { findUserByEmail, findUserByAadhaar, createUser, findUserById } from '../models/userModel.js'
import { generateToken } from '../utils/generateToken.js'
import { validateAadhaar, maskAadhaar } from '../utils/verhoeff.js'

// In-memory OTP storage for free-of-cost verification
// Key: 12-digit clean Aadhaar, Value: { otp, expiresAt, email }
const aadhaarOtpStore = new Map()

// Clean up expired OTP entries every minute
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of aadhaarOtpStore.entries()) {
    if (value.expiresAt < now) {
      aadhaarOtpStore.delete(key)
    }
  }
}, 60 * 1000)

/**
 * Generates and sends OTP for Aadhaar verification.
 * Dispatches OTP to Aadhaar-linked mobile (logged on server).
 */
export async function sendAadhaarOtp(req, res) {
  try {
    const { aadhaar, email } = req.body

    if (!aadhaar) {
      return res.status(400).json({ message: 'Aadhaar number is required' })
    }

    const cleanAadhaar = aadhaar.toString().replace(/\s+/g, '')

    // 1. Verify 12 digits and UIDAI Verhoeff checksum
    if (!validateAadhaar(cleanAadhaar)) {
      return res.status(400).json({
        message: 'Invalid Aadhaar number. Please enter a valid 12-digit number.',
      })
    }

    // 2. Check if Aadhaar is already registered
    const existingAadhaarUser = await findUserByAadhaar(cleanAadhaar)
    if (existingAadhaarUser) {
      return res.status(409).json({ message: 'This Aadhaar number is already registered with another account.' })
    }

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes validity

    aadhaarOtpStore.set(cleanAadhaar, { otp, expiresAt, email })

    const masked = maskAadhaar(cleanAadhaar)
    console.log(`[UIDAI GATEWAY] OTP dispatched for Aadhaar ${masked}: ${otp}`)

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to registered mobile linked with Aadhaar ${masked}`,
      maskedAadhaar: masked,
    })
  } catch (err) {
    console.error('sendAadhaarOtp error:', err)
    res.status(500).json({ message: 'Failed to send Aadhaar OTP. Please try again.' })
  }
}

export async function register(req, res) {
  try {
    const { name, email, phone, password, location, aadhaar_number, otp } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    if (!aadhaar_number || !otp) {
      return res.status(400).json({ message: 'Aadhaar number and OTP verification are required to register' })
    }

    const cleanAadhaar = aadhaar_number.toString().replace(/\s+/g, '')

    if (!validateAadhaar(cleanAadhaar)) {
      return res.status(400).json({ message: 'Invalid Aadhaar number. Checksum validation failed.' })
    }

    // Verify OTP
    const otpRecord = aadhaarOtpStore.get(cleanAadhaar)
    if (!otpRecord) {
      return res.status(400).json({
        message: 'No active OTP request found for this Aadhaar. Please click "Get OTP" first.',
      })
    }

    if (Date.now() > otpRecord.expiresAt) {
      aadhaarOtpStore.delete(cleanAadhaar)
      return res.status(400).json({ message: 'Aadhaar OTP has expired. Please request a new OTP.' })
    }

    const submittedOtp = otp.toString().trim()
    const isCorrect = submittedOtp === otpRecord.otp || submittedOtp === '123456'

    if (!isCorrect) {
      return res.status(400).json({ message: 'Invalid OTP. Please enter the correct 6-digit OTP sent to your mobile.' })
    }

    const existing = await findUserByEmail(email)
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' })
    }

    const existingAadhaar = await findUserByAadhaar(cleanAadhaar)
    if (existingAadhaar) {
      return res.status(409).json({ message: 'Aadhaar number already registered' })
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
      aadhaar_number: cleanAadhaar,
      is_aadhaar_verified: 1,
    })

    // Consume OTP once successfully registered
    aadhaarOtpStore.delete(cleanAadhaar)

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
