import pool from '../config/db.js'

export async function listUsers(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, role, location, status, created_at FROM users ORDER BY created_at DESC'
    )
    res.json({ users: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error fetching users' })
  }
}

export async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body // 'active' or 'blocked'
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or blocked' })
    }
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id])
    res.json({ message: 'User status updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error updating user' })
  }
}

export async function listAllEquipment(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, u.name AS owner_name FROM equipment e JOIN users u ON e.owner_id = u.id ORDER BY e.created_at DESC`
    )
    res.json({ equipment: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error fetching equipment' })
  }
}

export async function listAllBookings(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, e.name AS equipment_name, u.name AS renter_name
       FROM bookings b
       JOIN equipment e ON b.equipment_id = e.id
       JOIN users u ON b.renter_id = u.id
       ORDER BY b.created_at DESC`
    )
    res.json({ bookings: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error fetching bookings' })
  }
}

export async function analytics(req, res) {
  try {
    const [[userCount]] = await pool.query('SELECT COUNT(*) AS total FROM users')
    const [[equipmentCount]] = await pool.query('SELECT COUNT(*) AS total FROM equipment')
    const [[bookingCount]] = await pool.query('SELECT COUNT(*) AS total FROM bookings')
    const [[revenue]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'paid'"
    )
    res.json({
      totalUsers: userCount.total,
      totalEquipment: equipmentCount.total,
      totalBookings: bookingCount.total,
      totalRevenue: revenue.total,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error fetching analytics' })
  }
}
