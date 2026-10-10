import pool from '../config/db.js'

// Checks whether a new booking's time range clashes with any existing
// pending/accepted booking for the same equipment.
export async function hasOverlap(equipmentId, startDatetime, endDatetime) {
  const [rows] = await pool.query(
    `SELECT id FROM bookings
     WHERE equipment_id = ?
     AND status IN ('pending', 'accepted')
     AND NOT (end_datetime <= ? OR start_datetime >= ?)`,
    [equipmentId, startDatetime, endDatetime]
  )
  return rows.length > 0
}
