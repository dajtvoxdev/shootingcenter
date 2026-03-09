const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/json-file');

const DATA_DIR = path.join(__dirname, '../data');

// Embedded seed data to ensure it always exists
const DEFAULT_EQUIPMENT_CATEGORIES = [
  { name: "Camera", icon: "/media/images/equipment-camera-icon.png", iconSize: { width: 82, height: 76 } },
  { name: "Lens", icon: "/media/images/equipment-lens.png", iconSize: { width: 85, height: 85 } },
  { name: "Phụ kiện", icon: "/media/images/equipment-accessory.png", iconSize: { width: 68, height: 68 } },
  { name: "Thiết bị ánh sáng", icon: "/media/images/equipment-lighting.png", iconSize: { width: 70, height: 70 } },
  { name: "Thiết bị âm thanh", icon: "/media/images/equipment-microphone.png", iconSize: { width: 74, height: 74 } },
  { name: "Tripod/Gimbal", icon: "/media/images/equipment-tripod.png", iconSize: { width: 72, height: 72 } },
  { name: "Drone", icon: "/media/images/equipment-drone.png", iconSize: { width: 62, height: 62 } }
];

const DEFAULT_EQUIPMENT_ITEMS = [
  { id: 1, name: "SONY ALPHA FX3", accessories: "Phụ kiện: 2 x pin FZ100. 1 x Thẻ nhớ 64G", priceLabel: "800.000/ngày", pricePerDay: 800000, imagePath: "/media/images/equipment-camera-1.png", category: "Camera" },
  { id: 2, name: "SONY ALPHA FX30", accessories: "Phụ kiện: 2 x pin FZ100. 1 x Thẻ nhớ 64G", priceLabel: "700.000/ngày", pricePerDay: 700000, imagePath: "/media/images/equipment-camera-2.png", category: "Camera" },
  { id: 3, name: "Sony FE 24-70mm GM F2.8", accessories: "Phụ kiện: Filter chống bụi", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-lens-1.png", category: "Lens" },
  { id: 4, name: "Gimbal DJI Ronin S4", accessories: "Phụ kiện: Cable type C", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-tripod-1.png", category: "Tripod/Gimbal" },
  { id: 5, name: "DJI Air 3 Combo", accessories: "Phụ kiện: 3 x pin. 1 x Thẻ nhớ 64G", priceLabel: "Liên hệ*", pricePerDay: null, imagePath: "/media/images/equipment-drone-1.png", category: "Drone" },
  { id: 6, name: "Máy Thu Âm Cầm Tay Zoom H6", accessories: "Phụ kiện: Đầu mic XY", priceLabel: "250.000/ngày", pricePerDay: 250000, imagePath: "/media/images/equipment-audio-1.png", category: "Thiết bị âm thanh" },
  { id: 7, name: "Đèn Led Amaran 300C RGB", accessories: "Phụ kiện: 1 x Chân đèn", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-lighting-1.png", category: "Thiết bị ánh sáng" },
  { id: 8, name: "Accsoon Cineview SE", accessories: "Phụ kiện: Pin đi kèm 3 viên", priceLabel: "300.000/ngày", pricePerDay: 300000, imagePath: "/media/images/equipment-accessory-1.png", category: "Phụ kiện" }
];

const DEFAULT_SERVICE_CONFIG = {
  galleryImages: [
    "/media/images/project-1.png",
    "/media/images/project-2.png",
    "/media/images/project-3.png",
    "/media/images/project-4.png"
  ],
  conceptOptions: [
    { id: "has-concept", label: "Tôi đã có ý tưởng" },
    { id: "need-help", label: "Tôi cần hỗ trợ" }
  ],
  weekDays: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  monthNames: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"]
};

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
