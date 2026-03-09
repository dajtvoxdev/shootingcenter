const nodemailer = require('nodemailer');
const config = require('./index');

let transporter;

if (config.email.user && config.email.pass) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: false,
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  });
} else {
  transporter = nodemailer.createTransport({ jsonTransport: true });
}

module.exports = transporter;
