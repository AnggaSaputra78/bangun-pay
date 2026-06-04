import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import ProtectedRoute from '../features/auth/components/ProtectedRoute'
import MainLayout from '../layouts/MainLayout'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import ProjectsListPage from '../features/projects/pages/ProjectsListPage'
import ProjectDetailPage from '../features/projects/pages/ProjectDetailPage'
import ExpensesListPage from '../features/expenses/pages/ExpensesListPage'
import ReportsPage from '../features/reports/pages/ReportsPage' // 🆕
import MonitoringPage from '../features/monitoring/pages/MonitoringPage'

const Placeholder = ({ title }) => (
  <div className="card text-center py-12">
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p className="text-gray-500">Segera hadir</p>
  </div>
)

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900">
    <div className="text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page not found</p>
      <a href="/dashboard" className="btn btn-primary">Kembali</a>
    </div>
  </div>
)

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsListPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/expenses" element={<ExpensesListPage />} />
          <Route path="/reports" element={<ReportsPage />} /> {/* 🆕 */}
          <Route path="/monitoring" element={<Placeholder title="Monitoring" />} />
          <Route path="/notifications" element={<Placeholder title="Notifikasi" />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/monitoring" element={<MonitoringPage />} /> {/* 🆕 */}
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes