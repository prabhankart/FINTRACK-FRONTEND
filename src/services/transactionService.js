import api from './api';

const transactionService = {
  uploadFile: async (accountId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('account_id', accountId);
    const res = await api.post('/transactions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getTransactions: async (filters = {}) => {
    const res = await api.get('/transactions', { params: filters });
    return res.data;
  },

  getAnalytics: async (month, year) => {
    const res = await api.get('/transactions/analytics', {
      params: { month, year }
    });
    return res.data;
  },

  addTransaction: async (data) => {
    const res = await api.post('/transactions', data);
    return res.data;
  },

  deleteTransaction: async (id) => {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  }
};

export default transactionService;