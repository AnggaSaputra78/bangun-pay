import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import expenseService from '../../../services/expenseService'
import projectService from '../../../services/projectService'
import ExpenseStats from '../components/ExpenseStats'
import ExpenseFilterBar from '../components/ExpenseFilterBar'
import ExpenseTable from '../components/ExpenseTable'
import ExpenseDetailModal from '../components/ExpenseDetailModal'

const ExpensesListPage = () => {
  const queryClient = useQueryClient()
  
  const [filters, setFilters] = useState({
    search: '',
    projectId: '',
    categoryId: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
  })
  
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('expenseDate')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedExpense, setSelectedExpense] = useState(null)

  // Fetch projects for filter dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projectsForFilter'],
    queryFn: () => projectService.getAll({ limit: 1000 }),
    select: (res) => res.data || [],
    staleTime: 5 * 60 * 1000,
  })

  // Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: expenseService.getCategories,
    select: (res) => res.data || [],
    staleTime: 5 * 60 * 1000,
  })

  // Fetch expenses with filters
  const {
    data: expensesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['expenses', filters, page, sortBy, sortOrder],
    queryFn: () =>
      expenseService.getAll({
        ...filters,
        page,
        limit: 20,
        sort: sortOrder === 'asc' ? sortBy : `-${sortBy}`,
      }),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => expenseService.delete(id),
    onSuccess: () => {
      toast.success('Transaksi berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus transaksi')
    },
  })

  const expenses = expensesData?.data || []
  const pagination = expensesData?.pagination || { page: 1, pages: 1, total: 0 }

  const stats = useMemo(() => {
    if (expenses.length === 0) {
      return { totalAmount: 0, count: 0, avgAmount: 0, maxAmount: 0 }
    }
    const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
    const maxAmount = Math.max(...expenses.map((e) => e.amount || 0))
    return {
      totalAmount,
      count: expenses.length,
      avgAmount: totalAmount / expenses.length,
      maxAmount,
    }
  }, [expenses])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleReset = () => {
    setFilters({
      search: '',
      projectId: '',
      categoryId: '',
      paymentMethod: '',
      startDate: '',
      endDate: '',
    })
    setPage(1)
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Hapus transaksi "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  const handleExport = (type) => {
    if (type === 'csv' && expenses.length > 0) {
      const headers = ['Tanggal', 'Nama', 'Proyek', 'Kategori', 'Metode', 'Nominal']
      const rows = expenses.map((e) => [
        new Date(e.expenseDate).toLocaleDateString('id-ID'),
        e.name,
        e.projectId?.name || '',
        e.categoryId?.name || '',
        e.paymentMethod,
        e.amount,
      ])
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transaksi-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      toast.success('Export CSV berhasil!')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Riwayat Transaksi</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kelola semua pengeluaran dari seluruh proyek ({pagination.total} total)
        </p>
      </div>

      <ExpenseStats stats={stats} />

      <ExpenseFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        onExport={handleExport}
        projects={projectsData || []}
        categories={categoriesData || []}
      />

      <div className="card overflow-hidden p-0">
        <ExpenseTable
          expenses={expenses}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onView={setSelectedExpense}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-navy-700">
            <p className="text-sm text-gray-500">
              {(pagination.page - 1) * 20 + 1}-{Math.min(pagination.page * 20, pagination.total)} dari {pagination.total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn btn-secondary py-1.5 px-3 text-xs">
                Sebelumnya
              </button>
              <span className="text-sm text-gray-600 px-2">{page} / {pagination.pages}</span>
              <button onClick={() => setPage(Math.min(pagination.pages, page + 1))} disabled={page === pagination.pages} className="btn btn-secondary py-1.5 px-3 text-xs">
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedExpense && (
        <ExpenseDetailModal expense={selectedExpense} onClose={() => setSelectedExpense(null)} />
      )}
    </div>
  )
}

export default ExpensesListPage