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

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
