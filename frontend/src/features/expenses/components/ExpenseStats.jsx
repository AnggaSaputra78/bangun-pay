import { Receipt, TrendingDown, Calculator, ArrowUpRight } from 'lucide-react'

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)

const ExpenseStats = ({ stats }) => {
  const data = stats || { totalAmount: 0, count: 0, avgAmount: 0, maxAmount: 0 }
  const cards = [
    { title: 'Total Pengeluaran', value: formatCurrency(data.totalAmount), icon: TrendingDown, color: 'red', sub: `${data.count} transaksi` },
    { title: 'Rata-rata', value: formatCurrency(data.avgAmount), icon: Calculator, color: 'blue', sub: 'Per transaksi' },
    { title: 'Transaksi Tertinggi', value: formatCurrency(data.maxAmount), icon: ArrowUpRight, color: 'orange', sub: 'Single expense' },
    { title: 'Total Transaksi', value: data.count, icon: Receipt, color: 'green', sub: 'Seluruh periode' },
  ]
  const colors = { blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', red: 'bg-red-100 dark:bg-red-900/30 text-red-600', green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600', orange: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((s, i) => (
        <div key={i} className="card">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{s.title}</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[s.color]}`}><s.icon className="w-5 h-5" /></div>
          </div>
          <p className="text-xl font-bold text-navy-900 dark:text-white mb-1">{s.value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{s.sub}</p>
        </div>
      ))}
    </div>
  )
}
export default ExpenseStats