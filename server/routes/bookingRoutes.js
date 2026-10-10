import express from 'express'
import {
  requestBooking,
  myBookings,
  bookingRequests,
  respondToBooking,
  completeBooking,
} from '../controllers/bookingController.js'
import { protect } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

const router = express.Router()

router.post('/', protect, requireRole('farmer'), requestBooking)
router.get('/mine', protect, requireRole('farmer'), myBookings)
router.get('/requests', protect, requireRole('farmer'), bookingRequests)
router.patch('/:id/status', protect, requireRole('farmer'), respondToBooking)
router.patch('/:id/complete', protect, completeBooking)

export default router
