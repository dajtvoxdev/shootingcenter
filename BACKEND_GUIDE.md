# Hướng Dẫn Xây Dựng Backend - Shooting Center

## Mục Lục
1. [Tổng Quan](#1-tổng-quan)
2. [Cấu Trúc Backend](#2-cấu-trúc-backend)
3. [API Endpoints](#3-api-endpoints)
4. [Tích Hợp Sepay](#4-tích-hợp-sepay)
5. [Gửi Email](#5-gửi-email)
6. [Lưu Trữ Dữ Liệu](#6-lưu-trữ-dữ-liệu)
7. [Tích Hợp Frontend](#7-tích-hợp-frontend)
8. [Hướng Dẫn Cài Đặt](#8-hướng-dẫn-cài-đặt)

---

## 1. Tổng Quan

### 1.1 Yêu Cầu Chức Năng
| Chức năng | Mô tả |
|-----------|-------|
| **Đặt lịch** | Nhận booking từ Service page, lưu trữ, gửi thông báo |
| **Gửi email** | Khi contact form submit hoặc khi đặt lịch thành công |
| **Thanh toán** | Tạo QR Code Sepay, nhận webhook xác nhận thanh toán |

### 1.2 Tech Stack
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Email**: Nodemailer (Gmail SMTP)
- **Payment**: Sepay VietQR API
- **Storage**: File JS (không dùng database)

### 1.3 Phân Tích Frontend Hiện Tại

**Service.tsx (Đặt lịch - 6 bước):**
```
Bước 1: Chọn dịch vụ (outdoor-studio / production-house / rental-house)
Bước 2: Chọn loại dự án + thời lượng
Bước 3: Chọn ngân sách (1M - 100M)
Bước 4: Trạng thái concept
Bước 5: Chọn ngày (calendar)
Bước 6: Nhập số điện thoại
```

**Payment.tsx (Thanh toán):**
```
- Thông tin khách: fullName, email, phone, additionalInfo
- Phương thức: MoMo hoặc Bank Transfer (QR)
- Giá: 2.000.000 VND (cọc 25% = 500.000 VND)
```

**ContactForm.tsx (Liên hệ):**
```
- name, email, subject, message
- Gửi đến: shootingteam@gmail.com
```

---

## 2. Cấu Trúc Backend

```
backend/
├── package.json              # Dependencies
├── .env                      # Environment variables (không commit)
├── .env.example              # Template env
├── .gitignore
├── server.js                 # Entry point
│
├── config/
│   ├── index.js              # Load env variables
│   └── email.js              # Nodemailer transporter
│
├── routes/
│   ├── index.js              # Route aggregator
│   ├── booking.routes.js     # /api/bookings/*
│   ├── contact.routes.js     # /api/contacts/*
│   ├── payment.routes.js     # /api/payments/*
│   └── webhook.routes.js     # /api/webhook/*
│
├── controllers/
│   ├── booking.controller.js
│   ├── contact.controller.js
│   ├── payment.controller.js
│   └── webhook.controller.js
│
├── services/
│   ├── email.service.js      # Gửi email
│   ├── sepay.service.js      # Tạo QR, verify webhook
│   └── storage.service.js    # Đọc/ghi file data
│
├── data/
│   ├── bookings.js           # Danh sách booking
│   ├── contacts.js           # Danh sách liên hệ
│   ├── payments.js           # Danh sách thanh toán
│   └── booked-dates.js       # Ngày đã book (calendar)
│
├── middleware/
│   ├── cors.js               # CORS config
│   ├── validator.js          # Request validation
│   └── sepay-auth.js         # Webhook authentication
│
├── utils/
│   ├── id-generator.js       # Tạo ID unique
│   └── formatters.js         # Format tiền, ngày
│
└── templates/
    ├── booking-confirmation.html
    ├── contact-notification.html
    └── payment-success.html
```

---

## 3. API Endpoints

### 3.1 Booking APIs

#### `POST /api/bookings` - Tạo booking mới
**Request:**
```json
{
  "service": "production-house",
  "projectType": "TVC Quảng cáo",
  "duration": "Cả ngày(8-10 tiếng)",
  "budget": {
    "min": 5000000,
    "max": 20000000
  },
  "conceptStatus": "Đã có",
  "bookingDate": {
    "day": 15,
    "month": 6,
    "year": 2026
  },
  "phoneNumber": "0901234567"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "BK-20260222-001",
    "status": "pending",
    "createdAt": "2026-02-22T10:30:00.000Z"
  }
}
```

#### `GET /api/bookings/booked-dates/:year/:month` - Lấy ngày đã book
**Response:**
```json
{
  "success": true,
  "data": {
    "bookedDates": [8, 12, 15, 16]
  }
}
```

---

### 3.2 Contact APIs

#### `POST /api/contacts` - Gửi form liên hệ
**Request:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "example@gmail.com",
  "subject": "Hỏi về dịch vụ",
  "message": "Nội dung chi tiết..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "contactId": "CT-20260222-001",
    "message": "Cảm ơn bạn đã liên hệ!"
  }
}
```

---

### 3.3 Payment APIs

#### `POST /api/payments/create` - Tạo thanh toán + QR
> Nếu có `bookingId`, backend ưu tiên lấy tổng tiền từ `booking.budget.min` để tính tiền cọc 25%.

**Request:**
```json
{
  "bookingId": "BK-20260222-001",
  "customerInfo": {
    "fullName": "Nguyễn Văn A",
    "email": "example@gmail.com",
    "phone": "0901234567",
    "additionalInfo": "Ghi chú"
  },
  "services": [
    { "name": "Sản xuất reel instagram", "price": 2000000 }
  ],
  "paymentMethod": "bank",
  "paymentType": "deposit",
  "sendEmailConfirmation": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "PAY-20260222-001",
    "amount": 500000,
    "qrCodeUrl": "https://qr.sepay.vn/img?acc=XXX&bank=MB&amount=500000&des=PAY20260222001",
    "transactionCode": "PAY20260222001",
    "expiresAt": "2026-02-22T10:45:00.000Z",
    "status": "pending"
  }
}
```

#### `GET /api/payments/:id/status` - Kiểm tra trạng thái
**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "PAY-20260222-001",
    "status": "paid",
    "paidAt": "2026-02-22T10:35:00.000Z"
  }
}
```

---

### 3.4 Webhook APIs

#### `POST /api/webhook/sepay` - Nhận callback từ Sepay
**Headers:**
```
Authorization: Apikey YOUR_SEPAY_API_KEY
Content-Type: application/json
```

**Payload từ Sepay:**
```json
{
  "id": 92704,
  "gateway": "MBBank",
  "transactionDate": "2026-02-22 14:02:37",
  "accountNumber": "0123456789",
  "content": "PAY20260222001",
  "transferType": "in",
  "transferAmount": 500000,
  "referenceCode": "MBVCB.3278907687"
}
```

> Sau khi webhook xác nhận thanh toán thành công, backend mới chuyển booking sang `confirmed` và thêm ngày vào `booked-dates`.

**Response (bắt buộc):**
```json
{
  "success": true
}
```

---

## 4. Tích Hợp Sepay

### 4.1 Đăng Ký Tài Khoản Sepay
1. Truy cập [my.sepay.vn](https://my.sepay.vn)
2. Đăng ký tài khoản
3. Liên kết tài khoản ngân hàng
4. Lấy API Key từ menu **Webhooks**

### 4.2 Cấu Hình Webhook
1. Vào menu **Webhooks** > **+ Add webhooks**
2. Điền thông tin:
   - **Tên**: Shooting Center Payment
   - **Event**: Giao dịch vào (money in)
   - **Tài khoản**: Chọn tài khoản ngân hàng
   - **URL**: `https://your-domain.com/api/webhook/sepay`
   - **Authentication**: API Key
   - **Content-Type**: application/json

### 4.3 Tạo QR Code Động
```javascript
// services/sepay.service.js

function generateQRCodeUrl(transactionCode, amount) {
  const params = new URLSearchParams({
    acc: process.env.SEPAY_ACCOUNT,      // Số tài khoản
    bank: process.env.SEPAY_BANK_CODE,   // MB, VCB, TCB, etc.
    amount: amount.toString(),
    des: transactionCode                  // Nội dung chuyển khoản
  });

  return `https://qr.sepay.vn/img?${params.toString()}`;
}

// Ví dụ:
// https://qr.sepay.vn/img?acc=0123456789&bank=MB&amount=200000&des=PAY20260222001
```

### 4.4 Danh Sách Mã Ngân Hàng
| Ngân hàng | Mã |
|-----------|-----|
| MB Bank | MB |
| Vietcombank | VCB |
| Techcombank | TCB |
| VPBank | VPB |
| BIDV | BIDV |
| Agribank | AGR |
| TPBank | TPB |
| ACB | ACB |

### 4.5 Xử Lý Webhook

```javascript
// controllers/webhook.controller.js

async function handleSepayWebhook(req, res) {
  // 1. Verify API Key
  const authHeader = req.headers.authorization;
  if (authHeader !== `Apikey ${process.env.SEPAY_API_KEY}`) {
    return res.status(401).json({ success: false });
  }

  // 2. Lấy thông tin giao dịch
  const { content, transferAmount, transferType } = req.body;

  // 3. Chỉ xử lý tiền vào
  if (transferType !== 'in') {
    return res.json({ success: true });
  }

  // 4. Tìm payment theo transactionCode (content)
  const payment = findPaymentByTransactionCode(content);
  if (!payment) {
    return res.json({ success: true }); // Ack but no action
  }

  // 5. Kiểm tra đã xử lý chưa (idempotency)
  if (payment.status === 'paid') {
    return res.json({ success: true });
  }

  // 6. Cập nhật trạng thái
  updatePayment(payment.id, {
    status: 'paid',
    paidAt: new Date().toISOString(),
    sepayTransaction: req.body
  });

  // 7. Gửi email xác nhận
  if (payment.sendEmailConfirmation) {
    await sendPaymentConfirmation(payment);
  }

  // 8. Response (BẮT BUỘC)
  return res.json({ success: true });
}
```

---

## 5. Gửi Email

### 5.1 Cấu Hình Gmail SMTP

**Bước 1: Bật 2-Factor Authentication**
- Vào Google Account > Security > 2-Step Verification

**Bước 2: Tạo App Password**
- Google Account > Security > App passwords
- Chọn "Mail" và "Other (Custom name)"
- Copy password 16 ký tự

**Bước 3: Cấu hình .env**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=shootingteam@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

### 5.2 Email Service

```javascript
// config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

module.exports = transporter;
```

```javascript
// services/email.service.js
const transporter = require('../config/email');

const FROM = '"Shooting Center" <shootingteam@gmail.com>';
const ADMIN = 'shootingteam@gmail.com';

// Gửi thông báo khi có contact mới
async function sendContactNotification(contact) {
  // Gửi cho admin
  await transporter.sendMail({
    from: FROM,
    to: ADMIN,
    subject: `[Liên hệ mới] ${contact.subject}`,
    html: `
      <h2>Có liên hệ mới từ website</h2>
      <p><strong>Họ tên:</strong> ${contact.name}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Chủ đề:</strong> ${contact.subject}</p>
      <p><strong>Nội dung:</strong></p>
      <p>${contact.message}</p>
    `
  });

  // Gửi auto-reply cho khách
  await transporter.sendMail({
    from: FROM,
    to: contact.email,
    subject: 'Shooting Center - Đã nhận yêu cầu của bạn',
    html: `
      <p>Chào ${contact.name},</p>
      <p>Cảm ơn bạn đã liên hệ với Shooting Center.</p>
      <p>Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.</p>
      <br>
      <p>Trân trọng,<br>Shooting Team</p>
    `
  });
}

// Gửi thông báo khi có booking mới
async function sendBookingNotification(booking) {
  await transporter.sendMail({
    from: FROM,
    to: ADMIN,
    subject: `[Booking mới] ${booking.id} - ${booking.projectType}`,
    html: `
      <h2>Có booking mới</h2>
      <p><strong>Mã booking:</strong> ${booking.id}</p>
      <p><strong>Dịch vụ:</strong> ${booking.service}</p>
      <p><strong>Loại dự án:</strong> ${booking.projectType}</p>
      <p><strong>Ngân sách:</strong> ${formatCurrency(booking.budget.min)} - ${formatCurrency(booking.budget.max)}</p>
      <p><strong>Ngày bắt đầu:</strong> ${booking.bookingDate.day}/${booking.bookingDate.month + 1}/${booking.bookingDate.year}</p>
      <p><strong>SĐT:</strong> ${booking.phoneNumber}</p>
    `
  });
}

// Gửi xác nhận thanh toán
async function sendPaymentConfirmation(payment) {
  await transporter.sendMail({
    from: FROM,
    to: payment.customerInfo.email,
    subject: `[Thanh toán thành công] ${payment.id}`,
    html: `
      <h2>Xác nhận thanh toán</h2>
      <p>Chào ${payment.customerInfo.fullName},</p>
      <p>Cảm ơn bạn đã thanh toán. Dưới đây là thông tin đơn hàng:</p>
      <p><strong>Mã thanh toán:</strong> ${payment.id}</p>
      <p><strong>Số tiền:</strong> ${formatCurrency(payment.amountToPay)}</p>
      <p><strong>Dịch vụ:</strong> ${payment.services.map(s => s.name).join(', ')}</p>
      <p><strong>Thời gian:</strong> ${new Date(payment.paidAt).toLocaleString('vi-VN')}</p>
      <br>
      <p>Chúng tôi sẽ liên hệ với bạn sớm để xác nhận chi tiết.</p>
      <br>
      <p>Trân trọng,<br>Shooting Team</p>
    `
  });
}

module.exports = {
  sendContactNotification,
  sendBookingNotification,
  sendPaymentConfirmation
};
```

---

## 6. Lưu Trữ Dữ Liệu

### 6.1 Cấu Trúc File Data

```javascript
// data/bookings.js
const bookings = [
  {
    id: "BK-20260222-001",
    service: "production-house",
    projectType: "TVC Quảng cáo",
    duration: "Cả ngày(8-10 tiếng)",
    budget: { min: 5000000, max: 20000000 },
    conceptStatus: "Đã có",
    bookingDate: { day: 15, month: 6, year: 2026 },
    phoneNumber: "0901234567",
    status: "pending", // pending | confirmed | paid | completed | cancelled
    paymentId: null,
    createdAt: "2026-02-22T10:30:00.000Z",
    updatedAt: "2026-02-22T10:30:00.000Z"
  }
];

module.exports = { bookings };
```

```javascript
// data/payments.js
const payments = [
  {
    id: "PAY-20260222-001",
    bookingId: "BK-20260222-001",
    customerInfo: {
      fullName: "Nguyễn Văn A",
      email: "example@gmail.com",
      phone: "0901234567",
      additionalInfo: ""
    },
    services: [{ name: "Sản xuất reel instagram", price: 2000000 }],
    total: 2000000,
    depositRate: 0.25,
    amountToPay: 500000,
    paymentMethod: "bank",
    paymentType: "deposit",
    transactionCode: "PAY20260222001",
    qrCodeUrl: "https://qr.sepay.vn/img?...",
    status: "pending", // pending | paid | expired | cancelled
    sepayTransaction: null,
    sendEmailConfirmation: true,
    emailSent: false,
    createdAt: "2026-02-22T10:30:00.000Z",
    expiresAt: "2026-02-22T10:45:00.000Z",
    paidAt: null
  }
];

module.exports = { payments };
```

```javascript
// data/contacts.js
const contacts = [
  {
    id: "CT-20260222-001",
    name: "Nguyễn Văn A",
    email: "example@gmail.com",
    subject: "Hỏi về dịch vụ",
    message: "Nội dung...",
    status: "new", // new | read | replied
    createdAt: "2026-02-22T10:30:00.000Z"
  }
];

module.exports = { contacts };
```

```javascript
// data/booked-dates.js
const bookedDates = {
  "2026": {
    "1": [8, 12, 15, 16],  // Tháng 2 (0-indexed)
    "6": [15, 20, 25]      // Tháng 7
  }
};

module.exports = { bookedDates };
```

### 6.2 Storage Service

```javascript
// services/storage.service.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');

// Đọc data từ file
function loadData(filename) {
  delete require.cache[require.resolve(`../data/${filename}`)];
  return require(`../data/${filename}`);
}

// Ghi data vào file
function saveData(filename, variableName, data) {
  const content = `// Auto-generated - Last updated: ${new Date().toISOString()}

const ${variableName} = ${JSON.stringify(data, null, 2)};

module.exports = { ${variableName} };
`;
  fs.writeFileSync(path.join(DATA_DIR, filename), content, 'utf-8');
}

// Bookings
function getBookings() {
  return loadData('bookings.js').bookings;
}

function addBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  saveData('bookings.js', 'bookings', bookings);
  return booking;
}

function updateBooking(id, updates) {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    bookings[index] = { ...bookings[index], ...updates, updatedAt: new Date().toISOString() };
    saveData('bookings.js', 'bookings', bookings);
    return bookings[index];
  }
  return null;
}

// Payments
function getPayments() {
  return loadData('payments.js').payments;
}

function findPaymentByTransactionCode(code) {
  return getPayments().find(p => p.transactionCode === code);
}

function addPayment(payment) {
  const payments = getPayments();
  payments.push(payment);
  saveData('payments.js', 'payments', payments);
  return payment;
}

function updatePayment(id, updates) {
  const payments = getPayments();
  const index = payments.findIndex(p => p.id === id);
  if (index !== -1) {
    payments[index] = { ...payments[index], ...updates };
    saveData('payments.js', 'payments', payments);
    return payments[index];
  }
  return null;
}

// Contacts
function addContact(contact) {
  const contacts = loadData('contacts.js').contacts;
  contacts.push(contact);
  saveData('contacts.js', 'contacts', contacts);
  return contact;
}

// Booked Dates
function getBookedDates(year, month) {
  const data = loadData('booked-dates.js').bookedDates;
  return data[year]?.[month] || [];
}

function addBookedDate(year, month, day) {
  const data = loadData('booked-dates.js').bookedDates;
  if (!data[year]) data[year] = {};
  if (!data[year][month]) data[year][month] = [];
  if (!data[year][month].includes(day)) {
    data[year][month].push(day);
    data[year][month].sort((a, b) => a - b);
  }
  saveData('booked-dates.js', 'bookedDates', data);
}

module.exports = {
  getBookings, addBooking, updateBooking,
  getPayments, findPaymentByTransactionCode, addPayment, updatePayment,
  addContact,
  getBookedDates, addBookedDate
};
```

---

## 7. Tích Hợp Frontend

### 7.1 Tạo API Service

```typescript
// src/services/api.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
interface BookingRequest {
  service: string;
  projectType: string;
  duration: string | null;
  budget: { min: number; max: number };
  conceptStatus: string;
  bookingDate: { day: number; month: number; year: number };
  phoneNumber: string;
}

interface PaymentRequest {
  bookingId?: string;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    additionalInfo: string;
  };
  services: Array<{ name: string; price: number }>;
  paymentMethod: 'bank' | 'momo';
  paymentType: 'full' | 'deposit';
  sendEmailConfirmation: boolean;
}

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Booking API
export const bookingApi = {
  create: async (data: BookingRequest) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getBookedDates: async (year: number, month: number) => {
    const res = await fetch(`${API_BASE}/bookings/booked-dates/${year}/${month}`);
    return res.json();
  }
};

// Payment API
export const paymentApi = {
  create: async (data: PaymentRequest) => {
    const res = await fetch(`${API_BASE}/payments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  checkStatus: async (paymentId: string) => {
    const res = await fetch(`${API_BASE}/payments/${paymentId}/status`);
    return res.json();
  }
};

// Contact API
export const contactApi = {
  submit: async (data: ContactRequest) => {
    const res = await fetch(`${API_BASE}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
```

### 7.2 Sửa Service.tsx

```tsx
// src/pages/Service.tsx - Thêm vào

import { bookingApi } from '../services/api';

// Thay đổi bookedDates từ hardcode sang dynamic
useEffect(() => {
  bookingApi.getBookedDates(currentYear, currentMonth)
    .then(res => {
      if (res.success) {
        setBookedDates(res.data.bookedDates);
      }
    });
}, [currentMonth, currentYear]);

// Thay đổi handleSubmitPhone
const handleSubmitPhone = async () => {
  const bookingData = {
    service: selectedService,
    projectType: selectedProject,
    duration: selectedDuration,
    budget: { min: minBudget, max: maxBudget },
    conceptStatus: selectedConcept,
    bookingDate: {
      day: selectedDate,
      month: currentMonth,
      year: currentYear
    },
    phoneNumber: phoneNumber
  };

  try {
    const result = await bookingApi.create(bookingData);
    if (result.success) {
      // Lưu bookingId để dùng ở Payment page
      sessionStorage.setItem('bookingId', result.data.bookingId);
      setShowSuccessModal(true);
    } else {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  } catch (error) {
    console.error('Booking error:', error);
    alert('Có lỗi xảy ra. Vui lòng thử lại.');
  }
};
```

### 7.3 Sửa Payment.tsx

```tsx
// src/pages/Payment.tsx - Thêm vào

import { paymentApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Thêm states
const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
const [paymentId, setPaymentId] = useState<string | null>(null);
const [isProcessing, setIsProcessing] = useState(false);
const navigate = useNavigate();

// Thêm hàm xử lý đặt hàng
const handleOrderSubmit = async () => {
  setIsProcessing(true);

  const paymentData = {
    bookingId: sessionStorage.getItem('bookingId') || undefined,
    customerInfo: formData,
    services: [
      { name: "Sản xuất reel instagram", price: 2000000 }
    ],
    paymentMethod: paymentMethod as 'bank' | 'momo',
    paymentType: 'deposit' as const,
    sendEmailConfirmation: isEmailChecked
  };

  try {
    const result = await paymentApi.create(paymentData);
    if (result.success) {
      setQrCodeUrl(result.data.qrCodeUrl);
      setPaymentId(result.data.paymentId);
      startPolling(result.data.paymentId);
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('Có lỗi xảy ra. Vui lòng thử lại.');
  } finally {
    setIsProcessing(false);
  }
};

// Polling kiểm tra trạng thái thanh toán
const startPolling = (id: string) => {
  const interval = setInterval(async () => {
    try {
      const status = await paymentApi.checkStatus(id);
      if (status.data.status === 'paid') {
        clearInterval(interval);
        // Chuyển trang thành công hoặc hiện thông báo
        alert('Thanh toán thành công!');
        navigate('/');
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 3000); // Poll mỗi 3 giây

  // Dừng polling sau 15 phút
  setTimeout(() => clearInterval(interval), 15 * 60 * 1000);
};

// Thêm JSX hiển thị QR Code (trong section-payment-methods)
{qrCodeUrl && (
  <div className="qr-code-section" style={{ textAlign: 'center', marginTop: '20px' }}>
    <h3>Quét mã QR để thanh toán</h3>
    <img
      src={qrCodeUrl}
      alt="QR Code thanh toán"
      style={{ width: '250px', height: '250px' }}
    />
    <p>Số tiền: {formatPrice(500000)}</p>
    <p style={{ fontSize: '14px', color: '#666' }}>
      Mở app ngân hàng và quét mã QR. Thông tin sẽ được tự động điền.
    </p>
  </div>
)}

// Thêm onClick cho nút ĐẶT HÀNG
<button
  className="confirm-order-btn"
  onClick={handleOrderSubmit}
  disabled={isProcessing}
>
  {isProcessing ? 'Đang xử lý...' : 'ĐẶT HÀNG'}
</button>
```

### 7.4 Sửa ContactForm.tsx

```tsx
// src/components/ContactForm.tsx - Thêm vào

import { contactApi } from '../services/api';
import { useState } from 'react';

// Thêm state
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitted, setSubmitted] = useState(false);

// Thêm hàm xử lý submit
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsSubmitting(true);

  const formData = new FormData(e.currentTarget);
  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string
  };

  try {
    const result = await contactApi.submit(data);
    if (result.success) {
      setSubmitted(true);
      e.currentTarget.reset();
    } else {
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  } catch (error) {
    console.error('Contact error:', error);
    alert('Có lỗi xảy ra. Vui lòng thử lại.');
  } finally {
    setIsSubmitting(false);
  }
};

// Sửa form element
<form className="contact-form" onSubmit={handleSubmit}>
  {/* ... existing inputs với name attribute ... */}
  <input type="text" name="name" placeholder="Họ tên" required />
  <input type="email" name="email" placeholder="Email" required />
  <input type="text" name="subject" placeholder="Chủ đề" required />
  <textarea name="message" placeholder="Nội dung" rows={5} required />

  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Đang gửi...' : 'Submit'}
  </button>

  {submitted && <p style={{ color: 'green' }}>Cảm ơn bạn đã liên hệ!</p>}
</form>
```

### 7.5 Cấu hình Vite Proxy (Dev)

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

### 7.6 Environment Variables

```bash
# .env (frontend)
VITE_API_URL=http://localhost:3001/api
```

---

## 8. Hướng Dẫn Cài Đặt

### 8.1 Cài Đặt Backend

```bash
# Tạo thư mục backend
mkdir backend
cd backend

# Khởi tạo project
npm init -y

# Cài dependencies
npm install express cors dotenv nodemailer

# Cài dev dependencies
npm install -D nodemon

# Tạo cấu trúc thư mục
mkdir config routes controllers services data middleware utils templates
```

### 8.2 Package.json

```json
{
  "name": "shooting-center-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "nodemailer": "^6.9.13"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
```

### 8.3 File .env

```env
# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# Sepay
SEPAY_BANK_CODE=MB
SEPAY_ACCOUNT=0123456789
SEPAY_ACCOUNT_NAME=SHOOTING CENTER
SEPAY_API_KEY=your_sepay_api_key

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=shootingteam@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

### 8.4 Server Entry Point

```javascript
// server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', require('./routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### 8.5 Chạy Server

```bash
# Development
npm run dev

# Production
npm start
```

### 8.6 Test API

```bash
# Test health
curl http://localhost:3001/health

# Test booking
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"service":"production-house","projectType":"TVC Quảng cáo","phoneNumber":"0901234567"}'

# Test contact
curl -X POST http://localhost:3001/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@gmail.com","subject":"Test","message":"Hello"}'
```

---

## Lưu Ý Quan Trọng

### Security
1. **Không commit file .env** - Thêm vào .gitignore
2. **Verify webhook** - Luôn kiểm tra API Key từ Sepay
3. **Validate input** - Kiểm tra dữ liệu trước khi xử lý
4. **CORS** - Chỉ cho phép domain frontend

### Production
1. Sử dụng **PM2** hoặc **Docker** để chạy server
2. Setup **HTTPS** với Let's Encrypt
3. Thêm **rate limiting** cho APIs
4. **Backup** file data định kỳ
5. Xem xét chuyển sang **MongoDB/PostgreSQL** khi scale

### Limitations (File-based Storage)
- Không hỗ trợ concurrent writes tốt
- Không có indexing, tìm kiếm chậm với data lớn
- Phù hợp cho small-scale, prototype

---

## Tài Liệu Tham Khảo

- [Sepay - Tích hợp Webhooks](https://docs.sepay.vn/tich-hop-webhooks.html)
- [Sepay - Lập trình Webhooks](https://docs.sepay.vn/lap-trinh-webhooks.html)
- [Sepay - Tạo QR Code VietQR](https://docs.sepay.vn/tao-qr-code-vietqr-dong.html)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Express.js Guide](https://expressjs.com/)
