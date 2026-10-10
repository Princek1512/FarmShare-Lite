import { useEffect, useState } from 'react'
import api from '../api/axios'

const TABS = [
  { key: 'analytics', label: 'Analytics' },
  { key: 'users', label: 'Users' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'bookings', label: 'Bookings' },
]

function AdminDashboard() {
  const [tab, setTab] = useState('analytics')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [users, setUsers] = useState([])
  const [equipment, setEquipment] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTab(tab)
  }, [tab])

  async function loadTab(t) {
    setLoading(true)
    try {
      if (t === 'analytics') {
        const res = await api.get('/admin/analytics')
        setAnalyticsData(res.data)
      } else if (t === 'users') {
        const res = await api.get('/admin/users')
        setUsers(res.data.users)
      } else if (t === 'equipment') {
        const res = await api.get('/admin/equipment')
        setEquipment(res.data.equipment)
      } else if (t === 'bookings') {
        const res = await api.get('/admin/bookings')
        setBookings(res.data.bookings)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active'
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus })
      loadTab('users')
    } catch (err) {
      alert('Failed to update user status')
    }
  }

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              tab === t.key ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-green-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && tab === 'analytics' && analyticsData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-green-800">{analyticsData.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Equipment Listed</p>
            <p className="text-2xl font-bold text-green-800">{analyticsData.totalEquipment}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold text-green-800">{analyticsData.totalBookings}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Revenue Collected</p>
            <p className="text-2xl font-bold text-green-800">₹{analyticsData.totalRevenue}</p>
          </div>
        </div>
      )}

      {!loading && tab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => toggleStatus(u.id, u.status)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        {u.status === 'active' ? 'Block' : 'Unblock'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'equipment' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-100 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Price/hr</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3">{e.name}</td>
                  <td className="p-3 capitalize">{e.type.replace('_', ' ')}</td>
                  <td className="p-3">{e.owner_name}</td>
                  <td className="p-3">₹{e.price_per_hour}</td>
                  <td className="p-3">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && tab === 'bookings' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-green-100 text-left">
              <tr>
                <th className="p-3">Equipment</th>
                <th className="p-3">Renter</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-3">{b.equipment_name}</td>
                  <td className="p-3">{b.renter_name}</td>
                  <td className="p-3">₹{b.total_amount}</td>
                  <td className="p-3">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
