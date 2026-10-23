import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pool from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import equipmentRoutes from './routes/equipmentRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import adminRoutes from './routes/adminRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'FarmShare Lite API is running', health: '/api/health' })
})

app.use('/api/auth', authRoutes)
app.use('/api/equipment', equipmentRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result')
    res.json({ status: 'ok', dbTest: rows[0].result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'error', message: err.message })
  }
})

async function ensureDbSchema() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'aadhaar_number'")
    if (cols.length === 0) {
      console.log('Migrating: Adding aadhaar_number column to users table...')
      await pool.query('ALTER TABLE users ADD COLUMN aadhaar_number VARCHAR(12) NULL UNIQUE AFTER phone')
    }
    const [verifiedCols] = await pool.query("SHOW COLUMNS FROM users LIKE 'is_aadhaar_verified'")
    if (verifiedCols.length === 0) {
      console.log('Migrating: Adding is_aadhaar_verified column to users table...')
      await pool.query('ALTER TABLE users ADD COLUMN is_aadhaar_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER status')
    }
    console.log('Database schema for Aadhaar is up to date.')
  } catch (err) {
    console.warn('Aadhaar schema check note (proceeding normally):', err.message)
  }
}

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`)
  await ensureDbSchema()
})
