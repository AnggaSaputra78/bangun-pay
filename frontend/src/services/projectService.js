import axiosInstance from '../config/axios';

const API_URL = '/projects';

const projectService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_URL, { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post(API_URL, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await axiosInstance.get(`${API_URL}/dashboard/stats`);
    return response.data;
  },
};

export default projectService;