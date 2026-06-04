import { Trash2, Receipt } from 'lucide-react'
import { formatCurrency, formatDate } from '../../../utils/formatters'

const paymentMethodLabels = {
  cash: 'Cash',
  bank_transfer: 'Transfer Bank',
  e_wallet: 'E-Wallet',
  credit_card: 'Kartu Kredit',
}

const ExpenseTable = ({ expenses, onDelete }) => {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-12 h-12 text-gray-300 dark:text-navy-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">Belum ada pengeluaran</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-100 dark:border-navy-700">
          <tr>
            <th className="text-left py-3 px-2 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Tanggal</th>
            <th className="text-left py-3 px-2 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Nama</th>
            <th className="text-left py-3 px-2 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Kategori</th>
            <th className="text-left py-3 px-2 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Metode</th>
            <th className="text-right py-3 px-2 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Nominal</th>
            <th className="text-center py-3 px-2 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense._id} className="border-b border-gray-50 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-700/30">
              <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(expense.expenseDate)}
              </td>
              <td className="py-3 px-2">
                <p className="text-sm font-medium text-navy-900 dark:text-white">{expense.name}</p>
                {expense.description && (
                  <p className="text-xs text-gray-500 line-clamp-1">{expense.description}</p>
                )}
              </td>
              <td className="py-3 px-2">
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${expense.categoryId?.color || '#F97316'}20`,
                    color: expense.categoryId?.color || '#F97316',
                  }}
                >
                  {expense.categoryId?.name || '-'}
                </span>
              </td>
              <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
                {paymentMethodLabels[expense.paymentMethod] || expense.paymentMethod}
              </td>
              <td className="py-3 px-2 text-right text-sm font-semibold text-red-500">
                -{formatCurrency(expense.amount)}
              </td>
              <td className="py-3 px-2 text-center">
                <button
                  onClick={() => onDelete(expense._id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ExpenseTable