import api from './api';

const budgetService = {
  getBudgets: async (month, year) => {
    const res = await api.get('/budgets', { params: { month, year } });
    return res.data;
  },

  getBudgetOverview: async (month, year) => {
    const res = await api.get('/budgets/overview', { params: { month, year } });
    return res.data;
  },

  createBudget: async (data) => {
    const res = await api.post('/budgets', data);
    return res.data;
  },

  updateBudget: async (id, data) => {
    const res = await api.put(`/budgets/${id}`, data);
    return res.data;
  },

  deleteBudget: async (id) => {
    const res = await api.delete(`/budgets/${id}`);
    return res.data;
  }
};

export default budgetService;