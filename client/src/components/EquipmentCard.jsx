import { useState } from 'react'
import api from '../api/axios'

function EquipmentCard({ equipment, onEdit, onDelete, showAvailabilityForm, showBookingForm }) {
  const [showForm, setShowForm] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [savedRanges, setSavedRanges] = useState([])
  const [error, setError] = useState('')

  const [bookOpen, setBookOpen] = useState(false)
  const [bookStart, setBookStart] = useState('')
  const [bookEnd, setBookEnd] = useState('')
  const [bookError, setBookError] = useState('')
  const [bookSuccess, setBookSuccess] = useState('')
  const [bookLoading, setBookLoading] = useState(false)

  async function handleAddAvailability(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await api.post(`/equipment/${equipment.id}/availability`, { startDate, endDate })
      setSavedRanges(res.data.availability)
      setStartDate('')
      setEndDate('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add availability')
    }
  }

  async function handleBook(e) {
    e.preventDefault()
    setBookError('')
    setBookSuccess('')
    setBookLoading(true)
    try {
      await api.post('/bookings', {
        equipmentId: equipment.id,
        startDatetime: bookStart,
        endDatetime: bookEnd,
      })
      setBookSuccess('Booking request sent! Check "My Bookings" for status.')
      setBookStart('')
      setBookEnd('')
    } catch (err) {
      setBookError(err.response?.data?.message || 'Failed to send booking request')
    } finally {
      setBookLoading(false)
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{equipment.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{equipment.type.replace('_', ' ')}</p>
          <p className="text-green-700 font-medium mt-1">₹{equipment.price_per_hour}/hour</p>
          {equipment.location && (
            <p className="text-sm text-gray-400 mt-1">{equipment.location}</p>
          )}
          <span
            className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
              equipment.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {equipment.status}
          </span>
        </div>

        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button onClick={() => onEdit(equipment)} className="text-sm text-blue-600 hover:underline">
                Edit
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(equipment.id)} className="text-sm text-red-600 hover:underline">
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {showAvailabilityForm && (
        <div className="mt-4 border-t pt-3">
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm text-green-700 font-medium hover:underline"
          >
            {showForm ? 'Hide' : '+ Set Availability'}
          </button>

          {showForm && (
            <form onSubmit={handleAddAvailability} className="mt-2 flex flex-col gap-2">
              {error && <p className="text-red-600 text-xs">{error}</p>}
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                  required
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white text-sm py-1 rounded hover:bg-green-700"
              >
                Add Date Range
              </button>

              {savedRanges.length > 0 && (
                <ul className="text-xs text-gray-500 mt-1">
                  {savedRanges.map((r) => (
                    <li key={r.id}>
                      {r.start_date} → {r.end_date}
                    </li>
                  ))}
                </ul>
              )}
            </form>
          )}
        </div>
      )}

      {showBookingForm && (
        <div className="mt-4 border-t pt-3">
          <button
            onClick={() => setBookOpen(!bookOpen)}
            className="text-sm text-green-700 font-medium hover:underline"
          >
            {bookOpen ? 'Hide' : 'Book This Equipment'}
          </button>

          {bookOpen && (
            <form onSubmit={handleBook} className="mt-2 flex flex-col gap-2">
              {bookError && <p className="text-red-600 text-xs">{bookError}</p>}
              {bookSuccess && <p className="text-green-600 text-xs">{bookSuccess}</p>}
              <label className="text-xs text-gray-500">Start</label>
              <input
                type="datetime-local"
                value={bookStart}
                onChange={(e) => setBookStart(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                required
              />
              <label className="text-xs text-gray-500">End</label>
              <input
                type="datetime-local"
                value={bookEnd}
                onChange={(e) => setBookEnd(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
                required
              />
              <button
                type="submit"
                disabled={bookLoading}
                className="bg-green-600 text-white text-sm py-1 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {bookLoading ? 'Sending...' : 'Request Booking'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}

export default EquipmentCard
