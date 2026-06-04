import { useSelector } from 'react-redux'
import { Wallet, TrendingDown, PiggyBank, HardHat } from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
    orange: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600',
  }

  return (
    <div className="card-hover">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-navy-900 dark:text-white">{value}</p>
    </div>
  )
}

const DashboardPage = () => {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="card bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 border-0 text-white overflow-hidden relative">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">
            Selamat datang, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-primary-100">
            Berikut ringkasan proyek konstruksi Anda hari ini.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Dana"
          value="Rp 0"
          icon={Wallet}
          color="blue"
        />
        <StatCard
          title="Pengeluaran"
          value="Rp 0"
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Sisa Dana"
          value="Rp 0"
          icon={PiggyBank}
          color="green"
        />
        <StatCard
          title="Proyek Aktif"
          value="0"
          icon={HardHat}
          color="orange"
        />
      </div>

      {/* Info Card */}
      <div className="card">
        <h3 className="font-semibold text-navy-900 dark:text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎉</span>
          Setup Selesai!
        </h3>
        <div className="space-y-3 text-gray-600 dark:text-gray-400">
          <p>Aplikasi BangunPay sudah berjalan dengan baik.</p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">✓</span>
              <span>Backend API terhubung</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">✓</span>
              <span>Authentication berfungsi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">✓</span>
              <span>Tailwind CSS aktif</span>
            </li>
          </ul>
          <p className="text-sm mt-4 pt-4 border-t border-gray-200 dark:border-navy-700">
            Klik menu <strong>"Proyek"</strong> di sidebar untuk mulai membuat proyek konstruksi pertama Anda.
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage