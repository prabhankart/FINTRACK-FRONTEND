import api from './api';

const accountService = {
  getAccounts: async () => {
    const res = await api.get('/accounts');
    return res.data;
  },

  createAccount: async (data) => {
    const res = await api.post('/accounts', data);
    return res.data;
  },

  updateAccount: async (id, data) => {
    const res = await api.put(`/accounts/${id}`, data);
    return res.data;
  },

  deleteAccount: async (id) => {
    const res = await api.delete(`/accounts/${id}`);
    return res.data;
  }
};

export default accountService;