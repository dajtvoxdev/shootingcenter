const cors = require('cors');
const config = require('../config');

module.exports = cors({
  origin: config.frontendUrl,
  credentials: true
});
