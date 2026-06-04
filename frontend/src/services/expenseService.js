import axiosInstance from '../config/axios';

const API_URL = '/expenses';

const expenseService = {
  getByProject: async (projectId, params = {}) => {
    const response = await axiosInstance.get(`${API_URL}/project/${projectId}`, { params });
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post(API_URL, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  },

  getByCategory: async (projectId) => {
    const response = await axiosInstance.get(`${API_URL}/project/${projectId}/category-breakdown`);
    return response.data;
  },

  getRecent: async (limit = 5) => {
    const response = await axiosInstance.get(`${API_URL}/recent`, { params: { limit } });
    return response.data;
  },
};

export default expenseService;