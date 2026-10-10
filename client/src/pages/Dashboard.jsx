import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <h1 className="text-2xl font-bold text-green-800 mb-2">Welcome, {user?.name} 👋</h1>
      <p className="text-gray-600 mb-6">List your own equipment, or rent equipment from others — all from one account.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/my-equipment" className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-1">My Equipment</h2>
          <p className="text-sm text-gray-500">Add, edit, or remove machinery you're renting out.</p>
        </Link>
        <Link to="/requests" className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-1">Booking Requests</h2>
          <p className="text-sm text-gray-500">Accept or reject requests for your equipment.</p>
        </Link>
        <Link to="/search" className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-1">Search Equipment</h2>
          <p className="text-sm text-gray-500">Browse tractors, harvesters, pumps and more to rent.</p>
        </Link>
        <Link to="/bookings" className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg mb-1">My Bookings</h2>
          <p className="text-sm text-gray-500">Track requests you've sent to other owners.</p>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
