import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  FileText,
  BarChart3,
  Bell,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  Building2,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { logoutUser } from '../features/auth/slice/authSlice'
import toast from 'react-hot-toast'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Proyek', href: '/projects', icon: FolderKanban },
  { name: 'Transaksi', href: '/expenses', icon: Receipt },
  { name: 'Laporan', href: '/reports', icon: FileText },
  { name: 'Monitoring', href: '/monitoring', icon: BarChart3 },
  { name: 'Notifikasi', href: '/notifications', icon: Bell },
]

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { darkMode, toggleTheme } = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      toast.success('Logout berhasil')
      navigate('/login')
    } catch (error) {
      toast.error('Gagal logout')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-navy-800 border-r border-gray-200 dark:border-navy-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-navy-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-navy-900 dark:text-white text-lg">
                BangunPay
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-700 hover:text-primary-500'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-3 border-t border-gray-200 dark:border-navy-700">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-700/50 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.role?.replace('_', ' ') || 'Member'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg transition"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{darkMode ? 'Light' : 'Dark'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-navy-800/80 backdrop-blur border-b border-gray-200 dark:border-navy-700 px-4 lg:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg"
          >
            <Menu className="w-5 h-5 text-navy-900 dark:text-white" />
          </button>

          <div className="hidden lg:block">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Selamat datang kembali 👋
            </p>
            <h1 className="text-sm font-semibold text-navy-900 dark:text-white">
              {user?.name || 'User'}
            </h1>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-xl transition"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-navy-900" />
              )}
            </button>

            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-xl transition"
            >
              <Bell className="w-5 h-5 text-navy-900 dark:text-white" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-navy-800" />
            </button>

            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 animate-fade-in">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-navy-700 px-6 py-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            © 2026 BangunPay. Construction Project Management System.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default MainLayout