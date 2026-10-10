import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function AddEquipment() {
  const [form, setForm] = useState({
    name: '',
    type: 'tractor',
    pricePerHour: '',
    location: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/equipment', form)
      navigate('/owner')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add equipment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 p-8 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96 h-fit">
        <h2 className="text-2xl font-bold text-green-800 mb-6">Add Equipment</h2>

        {error && (
          <p className="bg-red-100 text-red-700 text-sm rounded px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Mahindra 575 Tractor"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        >
          <option value="tractor">Tractor</option>
          <option value="harvester">Harvester</option>
          <option value="pump">Irrigation Pump</option>
          <option value="seed_drill">Seed Drill</option>
          <option value="sprayer">Sprayer</option>
          <option value="thresher">Thresher</option>
        </select>

        <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour (₹)</label>
        <input
          name="pricePerHour"
          type="number"
          min="0"
          value={form.pricePerHour}
          onChange={handleChange}
          placeholder="900"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="e.g. Village A, Gondal"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Equipment'}
        </button>
      </form>
    </div>
  )
}

export default AddEquipment