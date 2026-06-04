import { Calendar, X } from 'lucide-react';

const DateRangeFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, onReset }) => {
  const hasFilter = startDate || endDate;

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="label text-xs">
            <Calendar className="w-3 h-3 inline mr-1" />
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="input py-2"
          />
        </div>
        <div className="flex-1">
          <label className="label text-xs">
            <Calendar className="w-3 h-3 inline mr-1" />
            Tanggal Selesai
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="input py-2"
          />
        </div>
        {hasFilter && (
          <button
            onClick={onReset}
            className="btn btn-ghost flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangeFilter;