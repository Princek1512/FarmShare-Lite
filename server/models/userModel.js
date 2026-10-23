import pool from '../config/db.js'

export async function findUserByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
  return rows[0] // undefined if no user found
}

export async function findUserByAadhaar(aadhaarNumber) {
  const [rows] = await pool.query('SELECT * FROM users WHERE aadhaar_number = ?', [aadhaarNumber])
  return rows[0]
}

export async function createUser({ name, email, phone, password, role, location, aadhaar_number, is_aadhaar_verified = 1 }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, phone, password, role, location, aadhaar_number, is_aadhaar_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, email, phone || null, password, role, location || null, aadhaar_number || null, is_aadhaar_verified ? 1 : 0]
  )
  return result.insertId
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, phone, role, location, status, aadhaar_number, is_aadhaar_verified, created_at FROM users WHERE id = ?',
    [id]
  )
  return rows[0]
}