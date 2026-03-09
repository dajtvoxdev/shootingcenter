const path = require('path');
const fs = require('fs');
const { readJsonFile, writeJsonFile } = require('../utils/json-file');

const DATA_DIR = path.join(__dirname, '../data');

// Helper to read seed JSON files
function readSeedFile(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error(`Error reading seed file ${filename}:`, e.message);
  }
  return [];
}

// Embedded seed data to ensure it always exists
// Load default equipment categories from JSON file
const DEFAULT_EQUIPMENT_CATEGORIES = readSeedFile('equipment-categories.json')

// Load default equipment items from JSON file
const DEFAULT_EQUIPMENT_ITEMS = readSeedFile('equipment-items.json')

// Load default service config from JSON file
const DEFAULT_SERVICE_CONFIG = readSeedFile('service-config.json')

function getDataFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

function loadData(filename, defaultValue) {
  const data = readJsonFile(getDataFilePath(filename), defaultValue);
  // Seed data if empty array
  if (Array.isArray(data) && data.length === 0 && Array.isArray(defaultValue) && defaultValue.length > 0) {
    saveData(filename, defaultValue);
    return defaultValue;
  }
  return data;
}

function saveData(filename, data) {
  writeJsonFile(getDataFilePath(filename), data);
}

function getBookings() {
  return loadData('bookings.json', []);
}

function addBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  saveData('bookings.json', bookings);
  return booking;
}

function updateBooking(id, updates) {
  const bookings = getBookings();
  const index = bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;
  bookings[index] = {
    ...bookings[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveData('bookings.json', bookings);
  return bookings[index];
}

function findBookingById(id) {
  return getBookings().find((b) => b.id === id) || null;
}

function getPayments() {
  return loadData('payments.json', []);
}

function findPaymentByTransactionCode(code) {
  const payments = getPayments();

  for (let i = payments.length - 1; i >= 0; i -= 1) {
    const payment = payments[i];
    if (payment.transactionCode === code && payment.status !== 'paid') {
      return payment;
    }
  }

  for (let i = payments.length - 1; i >= 0; i -= 1) {
    const payment = payments[i];
    if (payment.transactionCode === code) {
      return payment;
    }
  }

  return null;
}

function findPaymentById(id) {
  return getPayments().find((p) => p.id === id);
}

function addPayment(payment) {
  const payments = getPayments();
  payments.push(payment);
  saveData('payments.json', payments);
  return payment;
}

function updatePayment(id, updates) {
  const payments = getPayments();
  const index = payments.findIndex((p) => p.id === id);
  if (index === -1) return null;
  payments[index] = {
    ...payments[index],
    ...updates
  };
  saveData('payments.json', payments);
  return payments[index];
}

function getContacts() {
  return loadData('contacts.json', []);
}

function addContact(contact) {
  const contacts = getContacts();
  contacts.push(contact);
  saveData('contacts.json', contacts);
  return contact;
}

function getBookedDates(year, month) {
  const data = loadData('booked-dates.json', {});
  return data[String(year)]?.[String(month)] || [];
}

function addBookedDate(year, month, day) {
  const data = loadData('booked-dates.json', {});
  const y = String(year);
  const m = String(month);

  if (!data[y]) data[y] = {};
  if (!data[y][m]) data[y][m] = [];

  if (!data[y][m].includes(day)) {
    data[y][m].push(day);
    data[y][m].sort((a, b) => a - b);
  }

  saveData('booked-dates.json', data);
}

function getEquipmentCategories() {
  return loadData('equipment-categories.json', DEFAULT_EQUIPMENT_CATEGORIES);
}

function getEquipmentItems() {
  return loadData('equipment-items.json', DEFAULT_EQUIPMENT_ITEMS);
}

function addEquipmentItem(item) {
  const items = getEquipmentItems();
  items.push(item);
  saveData('equipment-items.json', items);
  return item;
}

function getServiceConfig() {
  return loadData('service-config.json', DEFAULT_SERVICE_CONFIG);
}

module.exports = {
  getBookings,
  addBooking,
  findBookingById,
  updateBooking,
  getPayments,
  findPaymentByTransactionCode,
  findPaymentById,
  addPayment,
  updatePayment,
  getContacts,
  addContact,
  getBookedDates,
  addBookedDate,
  getEquipmentCategories,
  getEquipmentItems,
  addEquipmentItem,
  getServiceConfig
};
