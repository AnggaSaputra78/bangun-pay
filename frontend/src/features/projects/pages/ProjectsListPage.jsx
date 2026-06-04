import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MapPin,
  User,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import projectService from '../../../services/projectService';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import ProjectModal from '../components/ProjectModal';

const statusColors = {
  planning: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  active: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  on_hold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  completed: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

const statusLabels = {
  planning: 'Perencanaan',
  active: 'Aktif',
  on_hold: 'Ditunda',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const ProjectsListPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery(
    ['projects', { search, status: statusFilter }],
    () => projectService.getAll({ search, status: statusFilter }),
    {
      select: (res) => res,
      keepPreviousData: true,
    }
  );

  const deleteMutation = useMutation(
    (id) => projectService.delete(id),
    {
      onSuccess: () => {
        toast.success('Proyek berhasil dihapus');
        queryClient.invalidateQueries('projects');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Gagal menghapus proyek');
      },
    }
  );

  const handleDelete = (id, name) => {
    if (window.confirm(`Hapus proyek "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const projects = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
            Manajemen Proyek
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola semua proyek konstruksi Anda
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Proyek
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari proyek..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input sm:w-48"
          >
            <option value="">Semua Status</option>
            <option value="planning">Perencanaan</option>
            <option value="active">Aktif</option>
            <option value="on_hold">Ditunda</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-navy-700 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 dark:bg-navy-700 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 dark:bg-navy-700 rounded w-2/3 mb-4" />
              <div className="h-2 bg-gray-200 dark:bg-navy-700 rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="card text-center py-12">
          <p className="text-red-500">Gagal memuat data proyek</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            {search || statusFilter
              ? 'Tidak ada proyek yang cocok dengan filter'
              : 'Belum ada proyek'}
          </p>
          {!search && !statusFilter && (
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary mt-2"
            >
              Buat Proyek Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const percentage = project.budgetPercentage || 0;
            const progressBarColor =
              percentage >= 80
                ? 'bg-red-500'
                : percentage >= 50
                ? 'bg-primary-500'
                : 'bg-emerald-500';

            return (
              <div key={project._id} className="card-hover group relative">
                {/* Menu Button */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1 bg-white dark:bg-navy-700 rounded-lg shadow-lg p-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleEdit(project);
                      }}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-navy-600 rounded transition"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(project._id, project.name);
                      }}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>

                <Link to={`/projects/${project._id}`} className="block">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-navy-900 dark:text-white pr-12">
                      {project.name}
                    </h4>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs rounded-full font-medium mb-3 ${statusColors[project.status]}`}
                  >
                    {statusLabels[project.status]}
                  </span>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <User className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{project.owner}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formatDate(project.startDate)}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-600 dark:text-gray-400">
                        Dana Terpakai
                      </span>
                      <span className="font-semibold text-navy-900 dark:text-white">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${progressBarColor} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-navy-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                      <p className="text-sm font-bold text-navy-900 dark:text-white">
                        {formatCurrency(project.initialBudget)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sisa</p>
                      <p className="text-sm font-bold text-emerald-500">
                        {formatCurrency(project.remainingBudget)}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Halaman {pagination.page} dari {pagination.pages} ({pagination.total}{' '}
            proyek)
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ProjectsListPage;