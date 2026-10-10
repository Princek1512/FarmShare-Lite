import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-green-700 text-white px-6 py-3 flex justify-between items-center flex-wrap gap-2">
      <Link to="/" className="font-bold text-lg">
        FarmShare Lite 🚜
      </Link>

      <div className="flex gap-4 items-center flex-wrap">
        {user ? (
          <>
            {user.role === 'farmer' && (
              <>
                <Link to="/dashboard" className="text-sm hover:underline">Dashboard</Link>
                <Link to="/my-equipment" className="text-sm hover:underline">My Equipment</Link>
                <Link to="/search" className="text-sm hover:underline">Search</Link>
                <Link to="/bookings" className="text-sm hover:underline">My Bookings</Link>
                <Link to="/requests" className="text-sm hover:underline">Requests</Link>
              </>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" className="text-sm hover:underline">Admin</Link>
            )}
            <span className="text-sm">
              {user.name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-green-900 px-3 py-1 rounded text-sm hover:bg-green-800"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm hover:underline">Login</Link>
            <Link to="/register" className="text-sm hover:underline">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
