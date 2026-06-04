import { useQuery } from '@tanstack/react-query';
import { TrendingDown, Calculator, Receipt, ArrowUpRight } from 'lucide-react';
import reportService from '../../../services/reportService';
import ReportExport from './ReportExport';

const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0);

const FinancialReport = ({ startDate, endDate, projectId }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['financialReport', startDate, endDate, projectId],
    queryFn: () => reportService.getFinancial({ startDate, endDate, projectId }),
    select: (res) => res.data,
  });

  if (isLoading) {
    return <div className="card text-center py-8 text-gray-500">Memuat laporan...</div>;
  }

  if (isError) {
    return <div className="card text-center py-8 text-red-500">Gagal memuat laporan</div>;
  }

  const { summary, monthlyBreakdown, categoryBreakdown, transactions } = data || {
    summary: { totalExpense: 0, totalTransactions: 0, avgTransaction: 0 },
    monthlyBreakdown: [],
    categoryBreakdown: [],
    transactions: [],
  };

  const stats = [
    { title: 'Total Pengeluaran', value: formatCurrency(summary.totalExpense), icon: TrendingDown, color: 'red' },
    { title: 'Total Transaksi', value: summary.totalTransactions, icon: Receipt, color: 'blue' },
    { title: 'Rata-rata', value: formatCurrency(summary.avgTransaction), icon: Calculator, color: 'green' },
    { title: 'Kategori Aktif', value: categoryBreakdown.length, icon: ArrowUpRight, color: 'orange' },
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

      {categoryBreakdown.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900 dark:text-white">Breakdown per Kategori</h3>
            <ReportExport data={categoryBreakdown} filename="laporan-kategori" type="categories" />
          </div>
          <div className="space-y-3">
            {categoryBreakdown.map((cat, i) => {
              const percentage = summary.totalExpense > 0 ? (cat.total / summary.totalExpense) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#F97316' }} />
                      <span className="text-gray-700 dark:text-gray-300">{cat.name}</span>
                      <span className="text-xs text-gray-500">({cat.count} transaksi)</span>
                    </div>
                    <span className="font-medium">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-navy-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: cat.color || '#F97316' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {transactions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900 dark:text-white">Detail Transaksi ({transactions.length})</h3>
            <ReportExport data={transactions} filename="laporan-transaksi" type="financial" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-navy-700/50 border-b border-gray-100 dark:border-navy-700">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Proyek</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 50).map((t) => (
                  <tr key={t._id} className="border-b border-gray-50 dark:border-navy-700">
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{new Date(t.expenseDate).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 px-4 text-sm font-medium text-navy-900 dark:text-white">{t.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{t.projectId?.name || '-'}</td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-red-500">-{formatCurrency(t.amount)}</td>
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

export default FinancialReport;