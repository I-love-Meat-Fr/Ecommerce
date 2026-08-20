import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function ProtectedRoute({ children, requireRole }) {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace state={{ from: location }} />
  }

  if (requireRole && user?.role !== requireRole) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
