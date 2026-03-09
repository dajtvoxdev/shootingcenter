const express = require('express');
const fs = require('fs');
const path = require('path');
const routes = require('./routes');
const config = require('./config');
const corsMiddleware = require('./middleware/cors');

const app = express();

const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(corsMiddleware);
app.use(express.json());
app.use('/media/images', express.static(path.join(__dirname, 'public/images')));
app.use('/media/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
