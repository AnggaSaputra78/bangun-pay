import axiosInstance from '../config/axios';

const API_URL = '/reports';

const reportService = {
  getFinancial: async (params = {}) => {
    const response = await axiosInstance.get(`${API_URL}/financial`, { params });
    return response.data;
  },

  getProjects: async (params = {}) => {
    const response = await axiosInstance.get(`${API_URL}/projects`, { params });
    return response.data;
  },

  getCategories: async (params = {}) => {
    const response = await axiosInstance.get(`${API_URL}/categories`, { params });
    return response.data;
  },
};

export default reportService;