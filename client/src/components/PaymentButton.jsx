import { useState } from 'react'
import api from '../api/axios'

function PaymentButton({ booking, onPaid }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/payments', { bookingId: booking.id })
      onPaid && onPaid(res.data.payment)
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <p className="text-red-600 text-xs mb-1">{error}</p>}
      <button
        onClick={handlePay}
        disabled={loading}
        className="bg-yellow-500 text-white text-sm px-3 py-1 rounded hover:bg-yellow-600 disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay ₹${booking.total_amount}`}
      </button>
    </div>
  )
}

export default PaymentButton
