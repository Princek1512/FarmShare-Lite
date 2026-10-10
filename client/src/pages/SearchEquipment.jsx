import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import EquipmentCard from '../components/EquipmentCard'

function SearchEquipment() {
  const { user } = useAuth()
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', location: '', maxPrice: '' })

  useEffect(() => {
    loadEquipment()
  }, [])

  async function loadEquipment(customFilters = filters) {
    setLoading(true)
    try {
      const params = {}
      if (customFilters.type) params.type = customFilters.type
      if (customFilters.location) params.location = customFilters.location
      if (customFilters.maxPrice) params.maxPrice = customFilters.maxPrice

      const res = await api.get('/equipment', { params })
      // Don't show the logged-in user their own listings here — this page
      // is for renting from others. Their own equipment lives under
      // "My Equipment".
      setEquipment(res.data.equipment.filter((item) => item.owner_id !== user?.id))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  function handleSearch(e) {
    e.preventDefault()
    loadEquipment(filters)
  }

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <h1 className="text-2xl font-bold text-green-800 mb-4">Find Equipment to Rent</h1>

      <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow flex gap-3 mb-6 flex-wrap">
        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All Types</option>
          <option value="tractor">Tractor</option>
          <option value="harvester">Harvester</option>
          <option value="pump">Irrigation Pump</option>
          <option value="seed_drill">Seed Drill</option>
          <option value="sprayer">Sprayer</option>
          <option value="thresher">Thresher</option>
        </select>

        <input
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
          placeholder="Location"
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        />

        <input
          name="maxPrice"
          type="number"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          placeholder="Max ₹/hour"
          className="border border-gray-300 rounded px-3 py-2 text-sm w-32"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-gray-500">Loading...</p>}
      {!loading && equipment.length === 0 && (
        <p className="text-gray-500">No equipment found matching your filters.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {equipment.map((item) => (
          <EquipmentCard key={item.id} equipment={item} showBookingForm />
        ))}
      </div>
    </div>
  )
}

export default SearchEquipment
