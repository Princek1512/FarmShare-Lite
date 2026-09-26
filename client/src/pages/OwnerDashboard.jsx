import { useAuth } from '../context/AuthContext'

function OwnerDashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-green-50 p-8">
      <h1 className="text-2xl font-bold text-green-800 mb-2">
        Welcome, {user?.name} 👋
      </h1>
      <p className="text-gray-600 mb-6">Manage your listed equipment and booking requests.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="font-semibold text-lg mb-1">My Equipment</h2>
          <p className="text-sm text-gray-500">Add, edit, or remove your listed machinery.</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <h2 className="font-semibold text-lg mb-1">Booking Requests</h2>
          <p className="text-sm text-gray-500">Accept or reject incoming booking requests.</p>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard