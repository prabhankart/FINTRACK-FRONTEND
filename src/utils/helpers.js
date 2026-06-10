// Format currency in INR
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Format date nicely
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Get current month and year
export const getCurrentMonthYear = () => ({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear()
});

// Get month name
export const getMonthName = (month) => {
  return new Date(2024, month - 1).toLocaleString('en-IN', { month: 'long' });
};

// Transaction type color
export const getTypeColor = (type) => {
  return type === 'credit' ? '#22c55e' : '#ef4444';
};