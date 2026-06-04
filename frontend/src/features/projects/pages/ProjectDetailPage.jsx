import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Edit, Trash2, MapPin, User, Calendar, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import projectService from '../../../services/projectService'
import expenseService from '../../../services/expenseService'
import { formatCurrency, formatDate } from '../../../utils/formatters'
import ExpenseTable from '../components/ExpenseTable'
import ExpenseModal from '../components/ExpenseModal'
import ProjectModal from '../components/ProjectModal'
import ProjectStats from '../components/ProjectStats'

const ProjectDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)

  // Fetch project detail
  const { data: projectData, isLoading: projectLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getById(id),
    select: (res) => res.data,
  })

  // Fetch expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ['projectExpenses', id],
    queryFn: () => expenseService.getByProject(id, { limit: 100 }),
    select: (res) => res.data || [],
    enabled: !!id,
  })

  // Fetch category breakdown
  const { data: categoryData } = useQuery({
    queryKey: ['projectCategories', id],
    queryFn: () => expenseService.getByCategory(id),
    select: (res) => res.data || [],
    enabled: !!id,
  })

  // Delete expense mutation
  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId) => expenseService.delete(expenseId),
    onSuccess: () => {
      toast.success('Pengeluaran berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['projectExpenses', id] })
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['projectCategories', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus pengeluaran')
    },
  })

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: () => projectService.delete(id),
    onSuccess: () => {
      toast.success('Proyek berhasil dihapus')
      navigate('/projects')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus proyek')
    },
  })

  const handleDeleteExpense = (expenseId) => {
    if (window.confirm('Hapus pengeluaran ini?')) {
      deleteExpenseMutation.mutate(expenseId)
    }
  }

  const handleDeleteProject = () => {
    if (window.confirm('Hapus proyek ini beserta semua pengeluarannya?')) {
      deleteProjectMutation.mutate()
    }
  }

  if (projectLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-navy-700 rounded w-32" />
        <div className="card h-48" />
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card h-64" />
          <div className="card h-64" />
        </div>
      </div>
    )
  }

  if (isError || !projectData) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Proyek Tidak Ditemukan</h3>
        <Link to="/projects" className="btn btn-primary mt-4">
          Kembali ke Daftar Proyek
        </Link>
      </div>
    )
  }

  const project = projectData
  const expenses = expensesData || []
  const categories = categoryData || []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Proyek
      </button>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
                {project.name}
              </h1>
              <StatusBadge status={project.status} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {project.location}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {project.owner}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(project.startDate)}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                {project.description}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowProjectModal(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDeleteProject}
              className="btn btn-danger flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <ProjectStats project={project} />

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-navy-900 dark:text-white mb-4">
            Distribusi Pengeluaran per Kategori
          </h3>
          <div className="space-y-3">
            {categories.map((cat) => {
              const percentage = project.totalExpense > 0
                ? (cat.total / project.totalExpense) * 100
                : 0
              return (
                <div key={cat._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{cat._id}</span>
                    <span className="font-medium">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: cat.color || '#F97316',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Expenses */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-navy-900 dark:text-white">
            Daftar Pengeluaran ({expenses.length})
          </h3>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengeluaran
          </button>
        </div>

        {expensesLoading ? (
          <div className="animate-pulse space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-navy-700 rounded" />
            ))}
          </div>
        ) : (
          <ExpenseTable
            expenses={expenses}
            onDelete={handleDeleteExpense}
          />
        )}
      </div>

      {/* Modals */}
      {showExpenseModal && (
        <ExpenseModal
          projectId={id}
          onClose={() => setShowExpenseModal(false)}
        />
      )}
      {showProjectModal && (
        <ProjectModal
          project={project}
          onClose={() => setShowProjectModal(false)}
        />
      )}
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const colors = {
    planning: 'bg-blue-100 text-blue-700',
    active: 'bg-emerald-100 text-emerald-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  const labels = {
    planning: 'Perencanaan',
    active: 'Aktif',
    on_hold: 'Ditunda',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }
  return (
    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  )
}

export default ProjectDetailPage