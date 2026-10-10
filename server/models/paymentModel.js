import pool from '../config/db.js'

export async function createPayment({ bookingId, amount }) {
  const [result] = await pool.query(
    'INSERT INTO payments (booking_id, amount) VALUES (?, ?)',
    [bookingId, amount]
  )
  return result.insertId
}

export async function getPaymentByBooking(bookingId) {
  const [rows] = await pool.query('SELECT * FROM payments WHERE booking_id = ?', [bookingId])
  return rows[0]
}

export async function markPaid(paymentId, transactionRef) {
  await pool.query(
    "UPDATE payments SET status = 'paid', transaction_ref = ?, payment_date = NOW() WHERE id = ?",
    [transactionRef, paymentId]
  )
}
