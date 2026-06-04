import { X, Calendar, MapPin, Receipt, CreditCard } from 'lucide-react'

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)
const formatDateTime = (date) => new Date(date).toLocaleString('id-ID')
const paymentLabels = { cash: 'Cash', bank_transfer: 'Transfer Bank', e_wallet: 'E-Wallet', credit_card: 'Kartu Kredit' }

const ExpenseDetailModal = ({ expense, onClose }) => {
  if (!expense) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between p-6 border-b border-gray-100 dark:border-navy-700 sticky top-0 bg-white dark:bg-navy-800 z-10">
          <h3 className="text-lg font-bold">Detail Transaksi</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
            <p className="text-sm opacity-90 mb-1">Total Pengeluaran</p>
            <p className="text-3xl font-bold">{formatCurrency(expense.amount)}</p>
          </div>
          <div className="space-y-3">
            <InfoRow icon={Receipt} label="Nama" value={expense.name} />
            <InfoRow icon={Calendar} label="Tanggal" value={formatDateTime(expense.expenseDate)} />
            <InfoRow icon={MapPin} label="Proyek" value={expense.projectId?.name || '-'} />
            <InfoRow icon={CreditCard} label="Metode" value={paymentLabels[expense.paymentMethod] || expense.paymentMethod} />
          </div>
        </div>
        <div className="p-6 border-t border-gray-100 dark:border-navy-700">
          <button onClick={onClose} className="btn btn-secondary w-full">Tutup</button>
        </div>
      </div>
    </div>
  )
}

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-navy-700 flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" /></div>
    <div><p className="text-xs text-gray-500">{label}</p><p className="text-sm font-medium text-navy-900 dark:text-white">{value}</p></div>
  </div>
)
export default ExpenseDetailModal