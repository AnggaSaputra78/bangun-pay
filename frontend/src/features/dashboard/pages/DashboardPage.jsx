import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  HardHat,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  FolderKanban,
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react'
import projectService from '../../../services/projectService'
import expenseService from '../../../services/expenseService'
import { formatCurrency, formatRelativeDate } from '../../../utils/formatters'

// ============================================
// STAT CARD COMPONENT
// ============================================
const StatCard = ({ title, value, icon: Icon, color, trend, trendLabel }) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-600',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-600',
    },
    green: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      text: 'text-emerald-600',
    },
    orange: {
      bg: 'bg-primary-100 dark:bg-primary-900/30',
      text: 'text-primary-600',
    },
  }

  const colors = colorClasses[color] || colorClasses.blue

  return (
    <div className="card-hover">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-navy-900 dark:text-white mb-1">
        {value}
      </p>
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-xs">
          {trend >= 0 ? (
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
          ) : (
            <ArrowDownRight className="w-3 h-3 text-red-500" />
          )}
          <span className={trend >= 0 ? 'text-emerald-500 font-medium' : 'text-red-500 font-medium'}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          {trendLabel && (
            <span className="text-gray-500 dark:text-gray-400">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// SKELETON LOADER
// ============================================
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="card bg-gray-200 dark:bg-navy-700 h-32" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card">
          <div className="h-3 bg-gray-200 dark:bg-navy-700 rounded w-1/2 mb-3" />
          <div className="h-8 bg-gray-200 dark:bg-navy-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-navy-700 rounded w-1/3" />
        </div>
      ))}
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card h-64" />
      <div className="card h-64" />
    </div>
  </div>
)

// ============================================
// ERROR STATE
// ============================================
const ErrorState = ({ message, onRetry }) => (
  <div className="card text-center py-12">
    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
    <h3 className="font-semibold text-navy-900 dark:text-white mb-1">
      Gagal Memuat Data
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
      {message}
    </p>
    {onRetry && (
      <button onClick={onRetry} className="btn btn-primary">
        Coba Lagi
      </button>
    )}
  </div>
)

// ============================================
// MAIN DASHBOARD PAGE
// ============================================
const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth)

  // Fetch dashboard statistics
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorObj,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: projectService.getDashboardStats,
    select: (res) => res.data,
    staleTime: 60 * 1000,
  })

  // Fetch recent expenses
  const {
    data: recentExpenses,
    isLoading: expensesLoading,
  } = useQuery({
    queryKey: ['recentExpenses'],
    queryFn: () => expenseService.getRecent(5),
    select: (res) => res.data,
    staleTime: 60 * 1000,
  })

  // Fetch recent projects
  const {
    data: projectsData,
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ['recentProjects'],
    queryFn: () => projectService.getAll({ limit: 3 }),
    select: (res) => res.data || [],
    staleTime: 60 * 1000,
  })

  // Loading state
  if (statsLoading || expensesLoading || projectsLoading) {
    return <DashboardSkeleton />
  }

  // Error state
  if (statsError) {
    return (
      <ErrorState
        message={statsErrorObj?.message || 'Tidak dapat memuat statistik dashboard'}
        onRetry={refetchStats}
      />
    )
  }

  const stats = statsData || {
    totalBudget: 0,
    totalExpense: 0,
    activeProjects: 0,
    totalProjects: 0,
  }

  const remaining = (stats.totalBudget || 0) - (stats.totalExpense || 0)
  const usagePercentage = stats.totalBudget > 0
    ? Math.round((stats.totalExpense / stats.totalBudget) * 100)
    : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="card bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 border-0 text-white overflow-hidden relative">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-white/5 rounded-full" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Selamat datang, {user?.name?.split(' ')[0]}! 👋
            </h2>
            <p className="text-primary-100">
              Berikut ringkasan proyek konstruksi Anda hari ini.
            </p>
          </div>
          <Link to="/projects" className="hidden sm:flex btn bg-white/20 hover:bg-white/30 text-white backdrop-blur border-0">
            <Plus className="w-4 h-4 mr-2" />
            Proyek Baru
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Dana"
          value={formatCurrency(stats.totalBudget)}
          icon={Wallet}
          color="blue"
          trend={12}
          trendLabel="vs bulan lalu"
        />
        <StatCard
          title="Pengeluaran"
          value={formatCurrency(stats.totalExpense)}
          icon={TrendingDown}
          color="red"
          trend={-5}
          trendLabel="vs bulan lalu"
        />
        <StatCard
          title="Sisa Dana"
          value={formatCurrency(remaining)}
          icon={PiggyBank}
          color="green"
        />
        <StatCard
          title="Proyek Aktif"
          value={stats.activeProjects || 0}
          icon={HardHat}
          color="orange"
        />
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Budget Usage Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900 dark:text-white">
              Penggunaan Dana
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Keseluruhan
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-navy-900 dark:text-white">
                  {usagePercentage}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dari total budget
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-navy-900 dark:text-white">
                  {formatCurrency(stats.totalExpense)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Terpakai
                </p>
              </div>
            </div>

            <div className="w-full h-3 bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  usagePercentage >= 80
                    ? 'bg-red-500'
                    : usagePercentage >= 50
                    ? 'bg-primary-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-navy-700">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Aktif</p>
                <p className="font-semibold text-navy-900 dark:text-white">
                  {stats.activeProjects || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Selesai</p>
                <p className="font-semibold text-navy-900 dark:text-white">
                  {(stats.totalProjects || 0) - (stats.activeProjects || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                <p className="font-semibold text-navy-900 dark:text-white">
                  {stats.totalProjects || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900 dark:text-white">
              Aktivitas Terbaru
            </h3>
            <Link
              to="/expenses"
              className="text-xs text-primary-500 hover:text-primary-600 font-medium"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-3">
            {recentExpenses && recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <div
                  key={expense._id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-navy-700 last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: `${expense.categoryId?.color || '#F97316'}20`,
                      }}
                    >
                      <Receipt
                        className="w-4 h-4"
                        style={{ color: expense.categoryId?.color || '#F97316' }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-navy-900 dark:text-white truncate">
                        {expense.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {expense.projectId?.name} • {formatRelativeDate(expense.expenseDate)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-500 whitespace-nowrap ml-3">
                    -{formatCurrency(expense.amount)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-300 dark:text-navy-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Belum ada aktivitas
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Projects List */}
      {projectsData && projectsData.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900 dark:text-white">
              Proyek Terbaru
            </h3>
            <Link
              to="/projects"
              className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
            >
              Lihat Semua
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsData.slice(0, 3).map((project) => {
              const percentage = project.budgetPercentage || 0
              const progressColor =
                percentage >= 80
                  ? 'bg-red-500'
                  : percentage >= 50
                  ? 'bg-primary-500'
                  : 'bg-emerald-500'

              return (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="block p-4 rounded-xl border border-gray-100 dark:border-navy-700 hover:border-primary-300 dark:hover:border-primary-500 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-navy-900 dark:text-white text-sm line-clamp-1">
                      {project.name}
                    </h4>
                    <FolderKanban className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                    {project.location}
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Terpakai</span>
                      <span className="font-medium text-navy-900 dark:text-white">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${progressColor} rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage