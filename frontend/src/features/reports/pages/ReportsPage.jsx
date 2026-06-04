import { useState } from 'react'
import { FileText, FolderKanban } from 'lucide-react'
import FinancialReport from '../components/FinancialReport'
import ProjectSummary from '../components/ProjectSummary'
import DateRangeFilter from '../components/DateRangeFilter'

const tabs = [
  { id: 'financial', label: 'Laporan Keuangan', icon: FileText },
  { id: 'projects', label: 'Ringkasan Proyek', icon: FolderKanban },
]

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('financial')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleResetDate = () => {
    setStartDate('')
    setEndDate('')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Laporan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Analisis dan laporan keuangan proyek konstruksi Anda
        </p>
      </div>

      <div className="card">
        <div className="flex gap-2 border-b border-gray-100 dark:border-navy-700 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'financial' && (
        <>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onReset={handleResetDate}
          />
          <FinancialReport startDate={startDate} endDate={endDate} />
        </>
      )}

      {activeTab === 'projects' && <ProjectSummary />}
    </div>
  )
}

export default ReportsPage