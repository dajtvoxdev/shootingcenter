function formatCurrency(amount) {
  return Number(amount || 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND'
  });
}

function formatDate(dateInput) {
  return new Date(dateInput).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
}

module.exports = {
  formatCurrency,
  formatDate
};
