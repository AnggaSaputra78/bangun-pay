import axiosInstance from '../config/axios'

const API_URL = '/expenses'

const expenseService = {
  // Get all expenses (cross-project) with filters
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_URL, { params })
    return response.data
  },

  // Get expenses by project
  getByProject: async (projectId, params = {}) => {
    const response = await axiosInstance.get(`${API_URL}/project/${projectId}`, { params })
    return response.data
  },

  // Get expense by ID
  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`)
    return response.data
  },

  // Create expense
  create: async (data) => {
    const response = await axiosInstance.post(API_URL, data)
    return response.data
  },

  // Update expense
  update: async (id, data) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data)
    return response.data
  },

  // Delete expense
  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`)
    return response.data
  },

  // Get category breakdown per project
  getByCategory: async (projectId) => {
    const response = await axiosInstance.get(`${API_URL}/project/${projectId}/category-breakdown`)
    return response.data
  },

  // Get recent expenses
  getRecent: async (limit = 5) => {
    const response = await axiosInstance.get(`${API_URL}/recent`, { params: { limit } })
    return response.data
  },

  // Get all categories
  getCategories: async () => {
    const response = await axiosInstance.get(`${API_URL}/categories`)
    return response.data
  },
}

export default expenseService