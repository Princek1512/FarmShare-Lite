import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { user, login } = useAuth()
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/" />
  }

  function handleSubmit(e) {
    e.preventDefault()
    // TEMPORARY fake login — pick a role to test with
    login({ name: 'Test Farmer', role: 'farmer' }, 'fake-token-123')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-bold text-green-800 mb-6">Login</h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          placeholder="you@example.com"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
          placeholder="••••••••"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded font-semibold hover:bg-green-700"
        >
          Login
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          No account?{' '}
          <Link to="/register" className="text-green-700 font-medium">
            Register
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login