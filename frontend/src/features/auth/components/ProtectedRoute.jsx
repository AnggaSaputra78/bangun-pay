import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

const ProtectedRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute