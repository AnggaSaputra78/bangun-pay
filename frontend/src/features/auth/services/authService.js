import axiosInstance from '../../../config/axios'

const API_URL = '/auth'

const authService = {
  // Register
  register: async (userData) => {
    const response = await axiosInstance.post(`${API_URL}/register`, userData)
    return response.data
  },

  // Login
  login: async (userData) => {
    const response = await axiosInstance.post(`${API_URL}/login`, userData)
    
    // Simpan token dan user data
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken)
      localStorage.setItem('user', JSON.stringify(response.data.data.user))
      
      // Simpan juga refresh token jika ada di cookie
      const refreshToken = response.data.data.refreshToken
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
    }
    
    return response.data
  },

  // Logout
  logout: async () => {
    try {
      await axiosInstance.post(`${API_URL}/logout`)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear localStorage meskipun request gagal
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  },

  // Get current user
  getMe: async () => {
    const response = await axiosInstance.get(`${API_URL}/me`)
    return response.data
  },
}

export default authService