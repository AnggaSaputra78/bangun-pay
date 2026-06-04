import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Filter, X, Search, Grid3x3, List } from 'lucide-react'
import toast from 'react-hot-toast'
import projectService from '../../../services/projectService'
import ProjectCard from '../components/ProjectCard'
import ProjectModal from '../components/ProjectModal'
import ProjectFilterBar from '../components/ProjectFilterBar'

const ProjectsListPage = () => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  // Fetch projects
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['projects', { search, status: statusFilter, page }],
    queryFn: () => projectService.getAll({ search, status: statusFilter, page, limit: 12 }),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => projectService.delete(id),
    onSuccess: () => {
      toast.success('Proyek berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus proyek')
    },
  })

  const handleDelete = (id, name) => {
    if (window.confirm(`Hapus proyek "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteMutation.mutate(id)
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProject(null)
  }

  const handleCreate = () => {
    setEditingProject(null)
    setShowModal(true)
  }

  const projects = data?.data || []
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
            Manajemen Proyek
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola semua proyek konstruksi Anda ({pagination.total} total)
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Proyek
        </button>
      </div>

      {/* Filter Bar */}
      <ProjectFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton viewMode={viewMode} />
      ) : isError ? (
        <ErrorState message={error?.message} />
      ) : projects.length === 0 ? (
        <EmptyState
          hasFilters={search || statusFilter}
          onCreate={handleCreate}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <ListView projects={projects} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}

      {/* Modal */}
      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

// ============ SUB-COMPONENTS ============

const LoadingSkeleton = ({ viewMode }) => (
  <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="card animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-navy-700 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-navy-700 rounded w-2/3 mb-4" />
        <div className="h-2 bg-gray-200 dark:bg-navy-700 rounded-full" />
      </div>
    ))}
  </div>
)

const ErrorState = ({ message }) => (
  <div className="card text-center py-12">
    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
      <X className="w-8 h-8 text-red-500" />
    </div>
    <h3 className="font-semibold text-navy-900 dark:text-white mb-2">
      Gagal Memuat Data
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-4">{message || 'Terjadi kesalahan'}</p>
    <button onClick={() => window.location.reload()} className="btn btn-primary">
      Muat Ulang
    </button>
  </div>
)

const EmptyState = ({ hasFilters, onCreate }) => (
  <div className="card text-center py-12">
    <div className="w-16 h-16 bg-gray-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
      <Filter className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="font-semibold text-navy-900 dark:text-white mb-2">
      {hasFilters ? 'Tidak ada proyek yang cocok' : 'Belum ada proyek'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 mb-4">
      {hasFilters
        ? 'Coba ubah filter atau kata kunci pencarian'
        : 'Mulai dengan membuat proyek konstruksi pertama Anda'}
    </p>
    {!hasFilters && (
      <button onClick={onCreate} className="btn btn-primary">
        <Plus className="w-4 h-4 mr-2" />
        Buat Proyek Pertama
      </button>
    )}
  </div>
)

const ListView = ({ projects, onEdit, onDelete }) => (
  <div className="card overflow-hidden p-0">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-navy-700/50 border-b border-gray-100 dark:border-navy-700">
          <tr>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Nama Proyek</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Lokasi</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Budget</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Progress</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project._id} className="border-b border-gray-50 dark:border-navy-700 hover:bg-gray-50 dark:hover:bg-navy-700/30">
              <td className="py-3 px-4">
                <p className="font-medium text-navy-900 dark:text-white">{project.name}</p>
                <p className="text-xs text-gray-500">{project.owner}</p>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{project.location}</td>
              <td className="py-3 px-4">
                <StatusBadge status={project.status} />
              </td>
              <td className="py-3 px-4 text-right text-sm font-medium">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(project.initialBudget)}
              </td>
              <td className="py-3 px-4 text-right">
                <span className="text-sm font-semibold">{project.budgetPercentage || 0}%</span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() => onEdit(project)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-navy-600 rounded transition"
                    title="Edit"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => onDelete(project._id, project.name)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                    title="Hapus"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)

const StatusBadge = ({ status }) => {
  const colors = {
    planning: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    active: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    on_hold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    completed: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  }
  const labels = {
    planning: 'Perencanaan',
    active: 'Aktif',
    on_hold: 'Ditunda',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 text-xs rounded-full font-medium ${colors[status] || colors.planning}`}>
      {labels[status] || status}
    </span>
  )
}

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-center gap-2">
    <button
      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1}
      className="btn btn-secondary"
    >
      Sebelumnya
    </button>
    <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
      Halaman {currentPage} dari {totalPages}
    </span>
    <button
      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage === totalPages}
      className="btn btn-secondary"
    >
      Selanjutnya
    </button>
  </div>
)

export default ProjectsListPage