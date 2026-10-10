import pool from '../config/db.js'

export async function createEquipment({ ownerId, name, type, pricePerHour, location }) {
  const [result] = await pool.query(
    'INSERT INTO equipment (owner_id, name, type, price_per_hour, location) VALUES (?, ?, ?, ?, ?)',
    [ownerId, name, type, pricePerHour, location || null]
  )
  return result.insertId
}

export async function getEquipmentByOwner(ownerId) {
  const [rows] = await pool.query(
    'SELECT * FROM equipment WHERE owner_id = ? ORDER BY created_at DESC',
    [ownerId]
  )
  return rows
}

export async function getEquipmentById(id) {
  const [rows] = await pool.query('SELECT * FROM equipment WHERE id = ?', [id])
  return rows[0]
}

export async function updateEquipment(id, { name, type, pricePerHour, location, status }) {
  await pool.query(
    'UPDATE equipment SET name = ?, type = ?, price_per_hour = ?, location = ?, status = ? WHERE id = ?',
    [name, type, pricePerHour, location, status, id]
  )
}

export async function deleteEquipment(id) {
  await pool.query('DELETE FROM equipment WHERE id = ?', [id])
}

export async function searchEquipmentByFilters({ type, location, maxPrice }) {
  let query = "SELECT * FROM equipment WHERE status = 'active'"
  const params = []

  if (type) {
    query += ' AND type = ?'
    params.push(type)
  }
  if (location) {
    query += ' AND location LIKE ?'
    params.push(`%${location}%`)
  }
  if (maxPrice) {
    query += ' AND price_per_hour <= ?'
    params.push(maxPrice)
  }

  query += ' ORDER BY created_at DESC'

  const [rows] = await pool.query(query, params)
  return rows
}
