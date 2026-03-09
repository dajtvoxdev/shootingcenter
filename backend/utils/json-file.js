const fs = require('fs');
const path = require('path');

function ensureJsonFile(filePath, defaultValue) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
  }
}

function readJsonFile(filePath, defaultValue) {
  ensureJsonFile(filePath, defaultValue);
  const raw = fs.readFileSync(filePath, 'utf-8');
  if (!raw.trim()) return defaultValue;
  return JSON.parse(raw);
}

function writeJsonFile(filePath, data) {
  ensureJsonFile(filePath, data);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  ensureJsonFile,
  readJsonFile,
  writeJsonFile
};
