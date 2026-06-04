import { Search, Filter, X, Download } from 'lucide-react'

const ExpenseFilterBar = ({ filters, onFilterChange, onReset, onExport, projects, categories }) => {
  const hasFilters = filters.search || filters.projectId || filters.categoryId || filters.paymentMethod || filters.startDate || filters.endDate
  return (
    <div className="card space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Cari transaksi..." value={filters.search} onChange={(e) => onFilterChange({ ...filters, search: e.target.value })} className="input pl-10" />
        </div>
        <button onClick={() => onExport('csv')} className="btn btn-secondary flex items-center gap-2"><Download className="w-4 h-4" />Export CSV</button>
        {hasFilters && <button onClick={onReset} className="btn btn-ghost flex items-center gap-2 text-red-500"><X className="w-4 h-4" />Reset</button>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <select value={filters.projectId} onChange={(e) => onFilterChange({ ...filters, projectId: e.target.value })} className="input py-2">
          <option value="">Semua Proyek</option>
          {projects?.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={filters.categoryId} onChange={(e) => onFilterChange({ ...filters, categoryId: e.target.value })} className="input py-2">
          <option value="">Semua Kategori</option>
          {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={filters.paymentMethod} onChange={(e) => onFilterChange({ ...filters, paymentMethod: e.target.value })} className="input py-2">
          <option value="">Semua Metode</option>
          <option value="cash">Cash</option><option value="bank_transfer">Transfer</option><option value="e_wallet">E-Wallet</option><option value="credit_card">Kartu Kredit</option>
        </select>
        <input type="date" value={filters.startDate} onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })} className="input py-2" />
      </div>
    </div>
  )
}
export default ExpenseFilterBar