import { getBookingById } from '../models/bookingModel.js'
import {
  createReview,
  getReviewByBooking,
  getReviewsForEquipment,
  getAverageRating,
} from '../models/reviewModel.js'

export async function addReview(req, res) {
  try {
    const { bookingId, rating, comment } = req.body
    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'bookingId and rating are required' })
    }

    const booking = await getBookingById(bookingId)
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }
    if (booking.renter_id !== req.userId) {
      return res.status(403).json({ message: 'Not your booking' })
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Booking must be completed before reviewing' })
    }

    const existing = await getReviewByBooking(bookingId)
    if (existing) {
      return res.status(409).json({ message: 'You already reviewed this booking' })
    }

    const id = await createReview({ bookingId, reviewerId: req.userId, rating, comment })
    res.status(201).json({ reviewId: id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error adding review' })
  }
}

export async function equipmentReviews(req, res) {
  try {
    const { equipmentId } = req.params
    const reviews = await getReviewsForEquipment(equipmentId)
    const avg = await getAverageRating(equipmentId)
    res.json({
      reviews,
      average: avg.avgRating ? Number(avg.avgRating).toFixed(1) : null,
      total: avg.totalReviews,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error fetching reviews' })
  }
}
