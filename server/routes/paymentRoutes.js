import express from 'express'
import { payForBooking, getPayment } from '../controllers/paymentController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, payForBooking)
router.get('/:bookingId', protect, getPayment)

export default router
