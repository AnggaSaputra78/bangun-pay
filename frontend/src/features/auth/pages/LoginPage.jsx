import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, reset } from '../slice/authSlice'
import { Building2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Login gagal. Periksa email dan password Anda.')
      dispatch(reset())
    }

    if (isSuccess || user) {
      toast.success('Login berhasil!')
      navigate('/dashboard')
    }

    dispatch(reset())
  }, [user, isError, isSuccess, message, navigate, dispatch])

  const onSubmit = async (data) => {
    console.log('📤 Login attempt:', data)
    dispatch(loginUser(data))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-xl shadow-primary-500/30 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            BangunPay
          </h1>
          <p className="text-gray-600">
            Construction Project Management
          </p>
        </div>

        {/* Login Form Card */}
        <div className="card shadow-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-2">
              Masuk ke Akun Anda
            </h2>
            <p className="text-sm text-gray-500">
              Silakan masukkan email dan password Anda
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email wajib diisi',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Format email tidak valid'
                  }
                })}
                className="input"
                placeholder="email@bangunpay.com"
                defaultValue="admin@bangunpay.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1.5 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password', { 
                  required: 'Password wajib diisi',
                  minLength: {
                    value: 8,
                    message: 'Password minimal 8 karakter'
                  }
                })}
                className="input"
                placeholder="••••••••"
                defaultValue="Password123"
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5 ml-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-3.5 text-base font-semibold flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link 
              to="/register" 
              className="font-semibold text-primary-500 hover:text-primary-600"
            >
              Daftar di sini
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 BangunPay. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default LoginPage