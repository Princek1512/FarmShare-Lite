import express from 'express'
import { register, login, getMe, sendAadhaarOtp } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/aadhaar/send-otp', sendAadhaarOtp)
router.get('/me', protect, getMe)

export default router