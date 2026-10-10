import pool from '../config/db.js'

export async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
  return rows[0] // undefined if no user found
}

export async function createUser({ name, email, phone, password, role, location }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, phone, password, role, location) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone || null, password, role, location || null]
  )
  return result.insertId
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, role, location, status, created_at FROM users WHERE id = ?',
    [id]
  )
  return rows[0]
}