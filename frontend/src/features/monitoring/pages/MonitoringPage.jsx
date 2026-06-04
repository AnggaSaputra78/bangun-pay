import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingDown, AlertTriangle, Clock, DollarSign } from 'lucide-react'
import projectService from '../../../services/projectService'
import expenseService from '../../../services/expenseService'
import reportService from '../../../services/reportService'
import { formatCurrency } from '../../../utils/formatters'

const COLORS = ['#F97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b']

const MonitoringPage = () => {
  const [timeRange, setTimeRange] = useState('6months')

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projectsMonitoring'],
    queryFn: () => projectService.getAll({ limit: 100 }),
    select: (res) => res.data || [],
  })

  const { data: financialData } = useQuery({
    queryKey: ['financialReport'],
    queryFn: () => reportService.getFinancial({}),
    select: (res) => res.data,
  })

  const { data: expensesData } = useQuery({
    queryKey: ['recentExpensesMonitoring'],
    queryFn: () => expenseService.getRecent(10),
    select: (res) => res.data || [],
  })

  const projects = projectsData || []
  const monthlyData = financialData?.monthlyBreakdown || []
  const categoryData = financialData?.categoryBreakdown || []

  const totalBudget = projects.reduce((sum, p) => sum + p.initialBudget, 0)
  const totalExpense = projects.reduce((sum, p) => sum + p.totalExpense, 0)
  const overallProgress = totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0
  const overbudgetProjects = projects.filter((p) => p.budgetPercentage > 90)
  const activeProjects = projects.filter((p) => p.status === 'active')

  const budgetVsActualData = projects.slice(0, 5).map((p) => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    budget: p.initialBudget,
    actual: p.totalExpense,
  }))

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Memuat data monitoring...</div>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Monitoring</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pantau performa dan progress seluruh proyek
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-navy-900 dark:text-white mt-2">
                {formatCurrency(totalBudget)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-navy-900 dark:text-white mt-2">
                {formatCurrency(totalExpense)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{overallProgress}% terpakai</p>
            </div>
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Proyek Aktif</p>
              <p className="text-2xl font-bold text-navy-900 dark:text-white mt-2">
                {activeProjects.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Peringatan</p>
              <p className="text-2xl font-bold text-navy-900 dark:text-white mt-2">
                {overbudgetProjects.length}
              </p>
              <p className="text-xs text-red-500 mt-1">
                {overbudgetProjects.length > 0 ? 'Perlu perhatian' : 'Semua aman'}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-4">
            Budget vs Actual
          </h3>
          {budgetVsActualData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetVsActualData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                <Bar dataKey="actual" fill="#F97316" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">Belum ada data proyek</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-navy-900 dark:text-white mb-4">
            Distribusi Kategori
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name }) => name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-12">Belum ada data kategori</p>
          )}
        </div>
      </div>

      {/* Overbudget Alerts */}
      {overbudgetProjects.length > 0 && (
        <div className="card border-2 border-red-200 dark:border-red-900/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-navy-900 dark:text-white">
              Peringatan Overbudget
            </h3>
          </div>
          <div className="space-y-3">
            {overbudgetProjects.map((project) => (
              <div key={project._id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <div>
                  <p className="font-semibold text-navy-900 dark:text-white">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-500">{project.budgetPercentage}%</p>
                  <p className="text-xs text-gray-500">Terpakai</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MonitoringPage