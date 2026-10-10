import { useState } from 'react'
import api from '../api/axios'
import PaymentButton from './PaymentButton'
import StarRating from './StarRating'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

function BookingCard({ booking, role, onUpdated }) {
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  async function respond(status) {
    setError('')
    try {
      await api.patch(`/bookings/${booking.id}/status`, { status })
      onUpdated && onUpdated()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking')
    }
  }

  async function markComplete() {
    setError('')
    try {
      await api.patch(`/bookings/${booking.id}/complete`)
      onUpdated && onUpdated()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete booking')
    }
  }

  async function submitReview(e) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/reviews', { bookingId: booking.id, rating, comment })
      setReviewOpen(false)
      onUpdated && onUpdated()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review')
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{booking.equipment_name}</h3>
          {role === 'owner' && (
            <p className="text-sm text-gray-500">Renter: {booking.renter_name}</p>
          )}
          <p className="text-sm text-gray-500">
            {new Date(booking.start_datetime).toLocaleString()} → {new Date(booking.end_datetime).toLocaleString()}
          </p>
          <p className="text-green-700 font-medium mt-1">
            ₹{booking.total_amount} ({booking.hours} hrs)
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${statusColors[booking.status] || 'bg-gray-100 text-gray-500'}`}>
          {booking.status}
        </span>
      </div>

      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2 items-center">
        {role === 'owner' && booking.status === 'pending' && (
          <>
            <button
              onClick={() => respond('accepted')}
              className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
            >
              Accept
            </button>
            <button
              onClick={() => respond('rejected')}
              className="bg-red-600 text-white text-sm px-3 py-1 rounded hover:bg-red-700"
            >
              Reject
            </button>
          </>
        )}

        {role === 'farmer' && booking.status === 'accepted' && (
          <PaymentButton booking={booking} onPaid={() => onUpdated && onUpdated()} />
        )}

        {booking.status === 'accepted' && (
          <button onClick={markComplete} className="text-sm text-blue-600 hover:underline">
            Mark Completed
          </button>
        )}

        {role === 'farmer' && booking.status === 'completed' && (
          <button onClick={() => setReviewOpen(!reviewOpen)} className="text-sm text-green-700 hover:underline">
            {reviewOpen ? 'Cancel' : 'Leave a Review'}
          </button>
        )}
      </div>

      {reviewOpen && (
        <form onSubmit={submitReview} className="mt-3 border-t pt-3 flex flex-col gap-2">
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the equipment?"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
          <button
            type="submit"
            className="bg-green-600 text-white text-sm py-1 rounded hover:bg-green-700 w-fit px-4"
          >
            Submit Review
          </button>
        </form>
      )}
    </div>
  )
}

export default BookingCard
