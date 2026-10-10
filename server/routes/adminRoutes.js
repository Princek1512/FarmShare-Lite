import express from 'express'
import {
  listUsers,
  toggleUserStatus,
  listAllEquipment,
  listAllBookings,
  analytics,
} from '../controllers/adminController.js'
import { protect } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

const router = express.Router()

router.use(protect, requireRole('admin'))

router.get('/users', listUsers)
router.patch('/users/:id/status', toggleUserStatus)
router.get('/equipment', listAllEquipment)
router.get('/bookings', listAllBookings)
router.get('/analytics', analytics)

export default router
