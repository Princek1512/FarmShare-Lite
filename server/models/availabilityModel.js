import pool from '../config/db.js'

export async function addAvailability(equipmentId, startDate, endDate) {
  const [result] = await pool.query(
    'INSERT INTO availability (equipment_id, start_date, end_date) VALUES (?, ?, ?)',
    [equipmentId, startDate, endDate]
  )
  return result.insertId
}

export async function getAvailabilityByEquipment(equipmentId) {
  const [rows] = await pool.query(
    'SELECT * FROM availability WHERE equipment_id = ? ORDER BY start_date ASC',
    [equipmentId]
  )
  return rows
}

export async function deleteAvailability(id) {
  await pool.query('DELETE FROM availability WHERE id = ?', [id])
}