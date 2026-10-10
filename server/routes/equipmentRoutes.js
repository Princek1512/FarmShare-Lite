import express from 'express'
import {
  addEquipment,
  getMyEquipment,
  editEquipment,
  removeEquipment,
  searchEquipment,
  createAvailabilityHandler,
  listAvailabilityHandler,
  removeAvailabilityHandler,
} from '../controllers/equipmentController.js'
import { protect } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

const router = express.Router()

router.get('/', searchEquipment)
router.get('/mine', protect, requireRole('farmer'), getMyEquipment)
router.post('/', protect, requireRole('farmer'), addEquipment)
router.put('/:id', protect, requireRole('farmer'), editEquipment)
router.delete('/:id', protect, requireRole('farmer'), removeEquipment)

router.get('/:id/availability', listAvailabilityHandler)
router.post('/:id/availability', protect, requireRole('farmer'), createAvailabilityHandler)
router.delete('/:id/availability/:availId', protect, requireRole('farmer'), removeAvailabilityHandler)

export default router
