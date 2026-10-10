import pool from '../config/db.js'

export async function createBooking({ equipmentId, renterId, startDatetime, endDatetime, hours, totalAmount }) {
  const [result] = await pool.query(
    'INSERT INTO bookings (equipment_id, renter_id, start_datetime, end_datetime, hours, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
    [equipmentId, renterId, startDatetime, endDatetime, hours, totalAmount]
  )
  return result.insertId
}

export async function getBookingById(id) {
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id])
  return rows[0]
}

export async function getBookingsByRenter(renterId) {
  const [rows] = await pool.query(
    `SELECT b.*, e.name AS equipment_name, e.type AS equipment_type, e.location AS equipment_location
     FROM bookings b
     JOIN equipment e ON b.equipment_id = e.id
     WHERE b.renter_id = ?
     ORDER BY b.created_at DESC`,
    [renterId]
  )
  return rows
}

export async function getBookingsForOwner(ownerId) {
  const [rows] = await pool.query(
    `SELECT b.*, e.name AS equipment_name, e.type AS equipment_type, u.name AS renter_name, u.phone AS renter_phone
     FROM bookings b
     JOIN equipment e ON b.equipment_id = e.id
     JOIN users u ON b.renter_id = u.id
     WHERE e.owner_id = ?
     ORDER BY b.created_at DESC`,
    [ownerId]
  )
  return rows
}

export async function updateBookingStatus(id, status) {
  await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id])
}
