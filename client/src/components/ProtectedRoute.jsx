import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute