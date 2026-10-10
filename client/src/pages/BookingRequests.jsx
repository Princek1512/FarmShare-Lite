import { useEffect, useState } from 'react'
import api from '../api/axios'
import BookingCard from '../components/BookingCard'

function BookingRequests() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/bookings/requests')
      setBookings(res.data.bookings)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Booking Requests</h1>

      {loading && <p className="text-gray-500">Loading...</p>}
      {!loading && bookings.length === 0 && <p className="text-gray-500">No booking requests yet.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bookings.map((b) => (
          <BookingCard key={b.id} booking={b} role="owner" onUpdated={load} />
        ))}
      </div>
    </div>
  )
}

export default BookingRequests
