import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import EquipmentCard from '../components/EquipmentCard'

function MyEquipment() {
  const { user } = useAuth()
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadEquipment()
  }, [])

  async function loadEquipment() {
    setLoading(true)
    try {
      const res = await api.get('/equipment/mine')
      setEquipment(res.data.equipment)
    } catch (err) {
      setError('Failed to load your equipment')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this equipment?')) return
    try {
      await api.delete(`/equipment/${id}`)
      setEquipment(equipment.filter((item) => item.id !== id))
    } catch (err) {
      alert('Failed to delete equipment')
    }
  }

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-green-800">My Equipment</h1>
          <p className="text-gray-600">Machinery you're renting out, {user?.name}.</p>
        </div>
        <Link
          to="/add-equipment"
          className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
        >
          + Add Equipment
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && equipment.length === 0 && (
        <p className="text-gray-500">You haven't listed any equipment yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {equipment.map((item) => (
          <EquipmentCard
            key={item.id}
            equipment={item}
            onDelete={handleDelete}
            showAvailabilityForm
          />
        ))}
      </div>
    </div>
  )
}

export default MyEquipment
