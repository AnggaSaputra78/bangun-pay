import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import projectService from '../../../services/projectService'

const ProjectModal = ({ project, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()
  const queryClient = useQueryClient()
  const isEdit = !!project

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        location: project.location,
        owner: project.owner,
        initialBudget: project.initialBudget,
        startDate: project.startDate?.split('T')[0],
        endDate: project.endDate?.split('T')[0] || '',
        status: project.status,
        description: project.description || '',
      })
    }
  }, [project, reset])

  const mutation = useMutation({
    mutationFn: (data) => isEdit
      ? projectService.update(project._id, data)
      : projectService.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Proyek berhasil diperbarui' : 'Proyek berhasil dibuat')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] })
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menyimpan proyek')
    },
  })

  const onSubmit = (data) => {
    mutation.mutate({
      ...data,
      initialBudget: Number(data.initialBudget),
      endDate: data.endDate || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-navy-700 sticky top-0 bg-white dark:bg-navy-800 z-10">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">
            {isEdit ? 'Edit Proyek' : 'Tambah Proyek Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Nama Proyek *</label>
            <input
              type="text"
              {...register('name', { required: 'Nama proyek wajib diisi' })}
              className="input"
              placeholder="Contoh: Renovasi Rumah Pak Budi"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Lokasi *</label>
              <input
                type="text"
                {...register('location', { required: 'Lokasi wajib diisi' })}
                className="input"
                placeholder="Kota, Provinsi"
              />
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
            </div>
            <div>
              <label className="label">Pemilik *</label>
              <input
                type="text"
                {...register('owner', { required: 'Nama pemilik wajib diisi' })}
                className="input"
                placeholder="Nama pemilik"
              />
              {errors.owner && <p className="text-xs text-red-500 mt-1">{errors.owner.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Dana Awal (Rp) *</label>
              <input
                type="number"
                {...register('initialBudget', {
                  required: 'Dana awal wajib diisi',
                  min: { value: 0, message: 'Budget tidak boleh negatif' },
                })}
                className="input"
                placeholder="0"
              />
              {errors.initialBudget && <p className="text-xs text-red-500 mt-1">{errors.initialBudget.message}</p>}
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="planning">Perencanaan</option>
                <option value="active">Aktif</option>
                <option value="on_hold">Ditunda</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tanggal Mulai *</label>
              <input
                type="date"
                {...register('startDate', { required: 'Tanggal mulai wajib diisi' })}
                className="input"
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="label">Tanggal Selesai</label>
              <input type="date" {...register('endDate')} className="input" />
            </div>
          </div>

          <div>
            <label className="label">Deskripsi</label>
            <textarea
              {...register('description', { maxLength: { value: 1000, message: 'Maksimal 1000 karakter' } })}
              rows={3}
              className="input resize-none"
              placeholder="Deskripsi singkat proyek..."
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-navy-800 py-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-secondary"
              disabled={mutation.isPending}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Menyimpan...' : isEdit ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectModal