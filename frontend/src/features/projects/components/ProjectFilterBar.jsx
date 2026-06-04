import { Search, Grid3x3, List } from 'lucide-react'

const ProjectFilterBar = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari proyek..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="input sm:w-48"
        >
          <option value="">Semua Status</option>
          <option value="planning">Perencanaan</option>
          <option value="active">Aktif</option>
          <option value="on_hold">Ditunda</option>
          <option value="completed">Selesai</option>
          <option value="cancelled">Dibatalkan</option>
        </select>

        {/* View Toggle */}
        <div className="flex gap-1 bg-gray-100 dark:bg-navy-700 p-1 rounded-xl">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg transition ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-navy-800 shadow-sm text-primary-500'
                : 'text-gray-500'
            }`}
            title="Grid View"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-white dark:bg-navy-800 shadow-sm text-primary-500'
                : 'text-gray-500'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectFilterBar