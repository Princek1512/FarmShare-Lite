import express from 'express'
import { addReview, equipmentReviews } from '../controllers/reviewController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, addReview)
router.get('/equipment/:equipmentId', equipmentReviews)

export default router
