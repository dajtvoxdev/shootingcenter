const config = require('../config');

module.exports = function sepayAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const expected = `Apikey ${config.sepay.apiKey}`;

  if (!config.sepay.apiKey || authHeader !== expected) {
    return res.status(401).json({ success: false });
  }

  return next();
};
