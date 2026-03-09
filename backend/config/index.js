const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  sepay: {
    bankCode: process.env.SEPAY_BANK_CODE || 'MB',
    account: process.env.SEPAY_ACCOUNT || '',
    accountName: process.env.SEPAY_ACCOUNT_NAME || 'SHOOTING CENTER',
    apiKey: process.env.SEPAY_API_KEY || ''
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    admin: process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'shootingteam@gmail.com'
  }
};
