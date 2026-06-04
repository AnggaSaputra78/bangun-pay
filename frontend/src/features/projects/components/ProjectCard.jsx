import { Link } from 'react-router-dom'
import { MapPin, User, Calendar, Edit, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '../../../utils/formatters'

const statusColors = {
  planning: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  active: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  on_hold: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  completed: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}

const statusLabels = {
  planning: 'Perencanaan',
  active: 'Aktif',
  on_hold: 'Ditunda',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const percentage = project.budgetPercentage || 0
  const progressBarColor =
    percentage >= 80 ? 'bg-red-500'
    : percentage >= 50 ? 'bg-primary-500'
    : 'bg-emerald-500'

  return (
    <div className="card-hover group relative">
      {/* Action Menu */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="flex gap-1 bg-white dark:bg-navy-700 rounded-lg shadow-lg p-1">
          <button
            onClick={(e) => {
              e.preventDefault()
              onEdit(project)
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-navy-600 rounded transition"
            title="Edit"
          >
            <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              onDelete(project._id, project.name)
            }}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
            title="Hapus"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>

      <Link to={`/projects/${project._id}`} className="block">
        <div className="flex items-start justify-between mb-3 pr-12">
          <h4 className="font-semibold text-navy-900 dark:text-white line-clamp-1">
            {project.name}
          </h4>
        </div>

        <span className={`inline-block px-2.5 py-0.5 text-xs rounded-full font-medium mb-3 ${statusColors[project.status]}`}>
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
            <span className="text-gray-600 dark:text-gray-400">Dana Terpakai</span>
            <span className="font-semibold text-navy-900 dark:text-white">{percentage}%</span>
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
  )
}

export default ProjectCard