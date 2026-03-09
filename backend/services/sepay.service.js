const config = require('../config');

function generateQRCodeUrl(transactionCode, amount) {
  const params = new URLSearchParams({
    acc: config.sepay.account,
    bank: config.sepay.bankCode,
    amount: String(amount),
    des: transactionCode
  });

  return `https://qr.sepay.vn/img?${params.toString()}`;
}

module.exports = {
  generateQRCodeUrl
};
