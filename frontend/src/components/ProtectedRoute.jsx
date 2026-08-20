import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated())
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
