import { Wallet, TrendingDown, PiggyBank, Percent } from 'lucide-react'
import { formatCurrency } from '../../../utils/formatters'

const ProjectStats = ({ project }) => {
  const percentage = project.budgetPercentage || 0

  const stats = [
    {
      title: 'Dana Awal',
      value: formatCurrency(project.initialBudget),
      icon: Wallet,
      color: 'blue',
    },
    {
      title: 'Total Pengeluaran',
      value: formatCurrency(project.totalExpense),
      icon: TrendingDown,
      color: 'red',
    },
    {
      title: 'Sisa Dana',
      value: formatCurrency(project.remainingBudget),
      icon: PiggyBank,
      color: 'green',
    },
    {
      title: 'Terpakai',
      value: `${percentage}%`,
      icon: Percent,
      color: percentage >= 80 ? 'red' : percentage >= 50 ? 'orange' : 'green',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
    orange: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="card">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              {stat.title}
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[stat.color]}`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl font-bold text-navy-900 dark:text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}

export default ProjectStats