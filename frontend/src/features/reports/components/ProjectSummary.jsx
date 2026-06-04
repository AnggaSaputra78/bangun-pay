import { useQuery } from '@tanstack/react-query';
import { FolderKanban, Wallet, TrendingDown, PiggyBank, AlertTriangle } from 'lucide-react';
import reportService from '../../../services/reportService';
import ReportExport from './ReportExport';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0);

const ProjectSummary = ({ status }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['projectReport', status],
    queryFn: () => reportService.getProjects({ status }),
    select: (res) => res.data,
  });

  if (isLoading) return <div className="card text-center py-8 text-gray-500">Memuat laporan...</div>;
  if (isError) return <div className="card text-center py-8 text-red-500">Gagal memuat laporan</div>;

  const { summary, statusBreakdown, overbudgetProjects, projects } = data || {
    summary: { totalProjects: 0, totalBudget: 0, totalExpense: 0, totalRemaining: 0, overallPercentage: 0 },
    statusBreakdown: [],
    overbudgetProjects: [],
    projects: [],
  };

  const stats = [
    { title: 'Total Proyek', value: summary.totalProjects, icon: FolderKanban, color: 'blue' },
    { title: 'Total Budget', value: formatCurrency(summary.totalBudget), icon: Wallet, color: 'green' },
    { title: 'Total Pengeluaran', value: formatCurrency(summary.totalExpense), icon: TrendingDown, color: 'red' },
    { title: 'Sisa Dana', value: formatCurrency(summary.totalRemaining), icon: PiggyBank, color: 'orange' },
  ];

  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
    orange: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{stat.title}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[stat.color]}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xl font-bold text-navy-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold text-navy-900 dark:text-white mb-4">Progress Keseluruhan</h3>
        <div className="flex items-end justify-between mb-3">
          <p className="text-3xl font-bold text-navy-900 dark:text-white">{summary.overallPercentage}%</p>
          <p className="text-sm font-semibold">{formatCurrency(summary.totalExpense)}</p>
        </div>
        <div className="w-full h-3 bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${summary.overallPercentage >= 80 ? 'bg-red-500' : summary.overallPercentage >= 50 ? 'bg-primary-500' : 'bg-emerald-500'}`} style={{ width: `${summary.overallPercentage}%` }} />
        </div>
      </div>

      {overbudgetProjects.length > 0 && (
        <div className="card border-2 border-red-200 dark:border-red-900/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-navy-900 dark:text-white">Peringatan Overbudget ({overbudgetProjects.length})</h3>
          </div>
          <div className="space-y-3">
            {overbudgetProjects.slice(0, 5).map((project) => (
              <div key={project._id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-900 dark:text-white truncate">{project.name}</p>
                  <p className="text-xs text-gray-500">{project.location}</p>
                </div>
                <p className="text-sm font-bold text-red-500 ml-4">{project.budgetPercentage}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900 dark:text-white">Daftar Proyek ({projects.length})</h3>
            <ReportExport data={projects} filename="laporan-proyek" type="projects" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-navy-700/50 border-b border-gray-100 dark:border-navy-700">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Progress</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p._id} className="border-b border-gray-50 dark:border-navy-700">
                    <td className="py-3 px-4 text-sm font-medium text-navy-900 dark:text-white">{p.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{p.status}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium">{formatCurrency(p.initialBudget)}</td>
                    <td className="py-3 px-4 text-right text-sm font-bold">{p.budgetPercentage || 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSummary;