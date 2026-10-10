import pool from '../config/db.js'

export async function createReview({ bookingId, reviewerId, rating, comment }) {
  const [result] = await pool.query(
    'INSERT INTO reviews (booking_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)',
    [bookingId, reviewerId, rating, comment || null]
  )
  return result.insertId
}

export async function getReviewByBooking(bookingId) {
  const [rows] = await pool.query('SELECT * FROM reviews WHERE booking_id = ?', [bookingId])
  return rows[0]
}

export async function getReviewsForEquipment(equipmentId) {
  const [rows] = await pool.query(
    `SELECT r.*, u.name AS reviewer_name
     FROM reviews r
     JOIN bookings b ON r.booking_id = b.id
     JOIN users u ON r.reviewer_id = u.id
     WHERE b.equipment_id = ?
     ORDER BY r.created_at DESC`,
    [equipmentId]
  )
  return rows
}

export async function getAverageRating(equipmentId) {
  const [rows] = await pool.query(
    `SELECT AVG(r.rating) AS avgRating, COUNT(*) AS totalReviews
     FROM reviews r
     JOIN bookings b ON r.booking_id = b.id
     WHERE b.equipment_id = ?`,
    [equipmentId]
  )
  return rows[0]
}
