import { ArrowUpDown, ArrowUp, ArrowDown, Trash2, Eye, Receipt } from 'lucide-react'

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)
const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
const paymentLabels = { cash: 'Cash', bank_transfer: 'Transfer', e_wallet: 'E-Wallet', credit_card: 'Kartu Kredit' }

const ExpenseTable = ({ expenses, onSort, sortBy, sortOrder, onView, onDelete, isLoading }) => {
  const SortBtn = ({ field, label }) => {
    const active = sortBy === field
    const Icon = active ? (sortOrder === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
    return <button onClick={() => onSort(field)} className={`flex items-center gap-1 text-xs font-medium uppercase ${active ? 'text-primary-500' : 'text-gray-500 dark:text-gray-400'}`}>{label}<Icon className="w-3 h-3" /></button>
  }

  if (isLoading) return <div className="p-8 text-center text-gray-500">Memuat data...</div>
  if (expenses.length === 0) return (
    <div className="text-center py-16">
      <Receipt className="w-12 h-12 text-gray-300 dark:text-navy-600 mx-auto mb-3" />
      <p className="text-gray-500">Tidak ada transaksi ditemukan</p>
    </div>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-navy-700/50 border-b border-gray-100 dark:border-navy-700">
          <tr>
            <th className="text-left py-3 px-4"><SortBtn field="expenseDate" label="Tanggal" /></th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nama</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Proyek</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Kategori</th>
            <th className="text-right py-3 px-4"><SortBtn field="amount" label="Nominal" /></th>
            <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e._id} className="border-b border-gray-50 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-700/30">
              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{formatDate(e.expenseDate)}</td>
              <td className="py-3 px-4 text-sm font-medium text-navy-900 dark:text-white">{e.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{e.projectId?.name || '-'}</td>
              <td className="py-3 px-4">
                <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: `${e.categoryId?.color || '#F97316'}20`, color: e.categoryId?.color || '#F97316' }}>{e.categoryId?.name || '-'}</span>
              </td>
              <td className="py-3 px-4 text-right text-sm font-semibold text-red-500">-{formatCurrency(e.amount)}</td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center gap-1">
                  <button onClick={() => onView(e)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-navy-600 rounded"><Eye className="w-4 h-4 text-gray-600" /></button>
                  <button onClick={() => onDelete(e._id, e.name)} className="p-1.5 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default ExpenseTable