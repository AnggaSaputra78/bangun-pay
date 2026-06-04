import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import expenseService from '../../../services/expenseService'
import axiosInstance from '../../../config/axios'

const ExpenseModal = ({ projectId, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const queryClient = useQueryClient()

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['expenseCategories'],
    queryFn: async () => {
      const res = await axiosInstance.get('/expenses/categories')
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const categories = categoriesData || []

  const mutation = useMutation({
    mutationFn: (data) => expenseService.create({ ...data, projectId }),
    onSuccess: () => {
      toast.success('Pengeluaran berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['projectExpenses', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projectCategories', projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['recentExpenses'] })
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menambah pengeluaran')
    },
  })

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      amount: Number(data.amount),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-navy-700 sticky top-0 bg-white dark:bg-navy-800 z-10">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">
            Tambah Pengeluaran
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Nama Pengeluaran *</label>
            <input
              type="text"
              {...register('name', { required: 'Nama wajib diisi' })}
              className="input"
              placeholder="Contoh: Semen Portland 50kg"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Kategori *</label>
              <select {...register('categoryId', { required: 'Kategori wajib dipilih' })} className="input">
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="label">Nominal (Rp) *</label>
              <input
                type="number"
                {...register('amount', {
                  required: 'Nominal wajib diisi',
                  min: { value: 1, message: 'Nominal harus lebih dari 0' },
                })}
                className="input"
                placeholder="0"
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tanggal *</label>
              <input
                type="date"
                {...register('expenseDate', { required: 'Tanggal wajib diisi' })}
                className="input"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
              {errors.expenseDate && <p className="text-xs text-red-500 mt-1">{errors.expenseDate.message}</p>}
            </div>
            <div>
              <label className="label">Metode Pembayaran</label>
              <select {...register('paymentMethod')} className="input">
                <option value="cash">Cash</option>
                <option value="bank_transfer">Transfer Bank</option>
                <option value="e_wallet">E-Wallet</option>
                <option value="credit_card">Kartu Kredit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Keterangan</label>
            <textarea
              {...register('description')}
              rows={3}
              className="input resize-none"
              placeholder="Keterangan tambahan..."
            />
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-navy-800 py-2">
            <button type="button" onClick={onClose} className="flex-1 btn btn-secondary" disabled={mutation.isPending}>
              Batal
            </button>
            <button type="submit" className="flex-1 btn btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExpenseModal