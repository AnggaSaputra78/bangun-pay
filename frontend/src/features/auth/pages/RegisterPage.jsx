import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser, reset } from '../slice/authSlice'
import { Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const { register: formRegister, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isError) { toast.error(message); dispatch(reset()) }
    if (isSuccess) { toast.success('Registrasi berhasil!'); navigate('/login') }
    dispatch(reset())
  }, [isError, isSuccess, message, navigate, dispatch])

  const onSubmit = (data) => dispatch(registerUser(data))

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">BangunPay</h1>
              <p className="text-xs text-gray-500">Construction Project Management</p>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-6">Daftar Akun Baru</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nama Lengkap</label>
              <input type="text" {...formRegister('name', { required: 'Nama wajib diisi' })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-primary-500" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" {...formRegister('email', { required: 'Email wajib diisi' })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-primary-500" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input type="password" {...formRegister('password', { required: 'Password wajib diisi', minLength: { value: 8, message: 'Min 8 karakter' } })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-primary-500" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50">
              {isLoading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun? <Link to="/login" className="text-primary-500 font-medium">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage