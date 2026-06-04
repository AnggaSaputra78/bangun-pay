import { FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

const ReportExport = ({ data, filename, type = 'financial' }) => {
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error('Tidak ada data untuk di-export');
      return;
    }

    let headers = [];
    let rows = [];

    if (type === 'financial') {
      headers = ['Tanggal', 'Nama', 'Proyek', 'Kategori', 'Metode', 'Nominal'];
      rows = data.map((e) => [
        new Date(e.expenseDate).toLocaleDateString('id-ID'),
        e.name,
        e.projectId?.name || '',
        e.categoryId?.name || '',
        e.paymentMethod,
        e.amount,
      ]);
    } else if (type === 'projects') {
      headers = ['Nama Proyek', 'Lokasi', 'Status', 'Budget', 'Pengeluaran', 'Sisa', 'Persentase'];
      rows = data.map((p) => [
        p.name,
        p.location,
        p.status,
        p.initialBudget,
        p.totalExpense,
        p.remainingBudget,
        `${p.budgetPercentage || 0}%`,
      ]);
    } else if (type === 'categories') {
      headers = ['Kategori', 'Total', 'Jumlah Transaksi', 'Rata-rata', 'Persentase'];
      rows = data.map((c) => [
        c.name,
        c.totalAmount,
        c.count,
        c.avgAmount,
        `${c.percentage}%`,
      ]);
    }

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Export CSV berhasil!');
  };

  return (
    <button
      onClick={exportToCSV}
      className="btn btn-secondary flex items-center gap-2"
      title="Export ke CSV"
    >
      <FileSpreadsheet className="w-4 h-4" />
      <span className="hidden sm:inline">Export CSV</span>
    </button>
  );
};

export default ReportExport;