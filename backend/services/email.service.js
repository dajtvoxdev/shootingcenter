const transporter = require('../config/email');
const config = require('../config');
const { formatCurrency } = require('../utils/formatters');

const FROM = `"Shooting Center" <${config.email.user || 'shootingteam@gmail.com'}>`;
const ADMIN = config.email.admin;

async function sendContactToAdmin(contact) {
  if (!ADMIN) {
    throw new Error('ADMIN_EMAIL is missing');
  }

  return transporter.sendMail({
    from: FROM,
    to: ADMIN,
    replyTo: contact.email,
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
}

async function sendContactAutoReply(contact) {
  return transporter.sendMail({
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

async function sendContactNotification(contact) {
  const [adminResult, userResult] = await Promise.allSettled([
    sendContactToAdmin(contact),
    sendContactAutoReply(contact)
  ]);

  if (adminResult.status === 'rejected') {
    throw adminResult.reason;
  }

  if (userResult.status === 'rejected') {
    console.error('sendContactAutoReply failed:', userResult.reason?.message || userResult.reason);
  }
}

async function sendBookingNotification(booking) {
  if (!ADMIN) {
    throw new Error('ADMIN_EMAIL is missing');
  }

  await transporter.sendMail({
    from: FROM,
    to: ADMIN,
    subject: `[Booking mới] ${booking.id} - ${booking.projectType}`,
    html: `
      <h2>Có booking mới</h2>
      <p><strong>Mã booking:</strong> ${booking.id}</p>
      <p><strong>Dịch vụ:</strong> ${booking.service}</p>
      <p><strong>Loại dự án:</strong> ${booking.projectType}</p>
      <p><strong>Thời lượng:</strong> ${booking.duration || 'Không có'}</p>
      <p><strong>Ngân sách:</strong> ${formatCurrency(booking.budget.min)} - ${formatCurrency(booking.budget.max)}</p>
      <p><strong>Trạng thái concept:</strong> ${booking.conceptStatus}</p>
      <p><strong>Ngày bắt đầu:</strong> ${booking.bookingDate.day}/${booking.bookingDate.month + 1}/${booking.bookingDate.year}</p>
      <p><strong>SĐT:</strong> ${booking.phoneNumber}</p>
      <p><strong>Thời gian tạo:</strong> ${new Date(booking.createdAt).toLocaleString('vi-VN')}</p>
    `
  });
}

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
      <p><strong>Dịch vụ:</strong> ${payment.services.map((s) => s.name).join(', ')}</p>
      <p><strong>Thời gian:</strong> ${new Date(payment.paidAt).toLocaleString('vi-VN')}</p>
      <br>
      <p>Chúng tôi sẽ liên hệ với bạn sớm để xác nhận chi tiết.</p>
      <br>
      <p>Trân trọng,<br>Shooting Team</p>
    `
  });
}

async function sendBookingConfirmedToAdmin(booking, payment) {
  if (!ADMIN) {
    throw new Error('ADMIN_EMAIL is missing');
  }

  await transporter.sendMail({
    from: FROM,
    to: ADMIN,
    replyTo: payment?.customerInfo?.email || undefined,
    subject: `[Booking xác nhận] ${booking.id} - ${booking.projectType}`,
    html: `
      <h2>Booking đã được xác nhận thanh toán</h2>
      <p><strong>Mã booking:</strong> ${booking.id}</p>
      <p><strong>Mã thanh toán:</strong> ${payment?.id || 'N/A'}</p>
      <p><strong>Dịch vụ:</strong> ${booking.service}</p>
      <p><strong>Loại dự án:</strong> ${booking.projectType}</p>
      <p><strong>Thời lượng:</strong> ${booking.duration || 'Không có'}</p>
      <p><strong>Ngân sách:</strong> ${formatCurrency(booking.budget.min)} - ${formatCurrency(booking.budget.max)}</p>
      <p><strong>Ngày quay:</strong> ${booking.bookingDate.day}/${booking.bookingDate.month + 1}/${booking.bookingDate.year}</p>
      <p><strong>SĐT khách:</strong> ${booking.phoneNumber}</p>
      <p><strong>Email khách:</strong> ${payment?.customerInfo?.email || 'Không có'}</p>
      <p><strong>Số tiền cọc:</strong> ${payment ? formatCurrency(payment.amountToPay) : 'N/A'}</p>
      <p><strong>Thời gian thanh toán:</strong> ${payment?.paidAt ? new Date(payment.paidAt).toLocaleString('vi-VN') : 'N/A'}</p>
    `
  });
}

async function sendBookingConfirmedToCustomer(booking, payment) {
  if (!payment?.customerInfo?.email) {
    return;
  }

  await transporter.sendMail({
    from: FROM,
    to: payment.customerInfo.email,
    subject: `[Xác nhận lịch thành công] ${booking.id}`,
    html: `
      <h2>Lịch quay của bạn đã được xác nhận ✅</h2>
      <p>Chào ${payment.customerInfo.fullName || 'bạn'},</p>
      <p>Cảm ơn bạn đã hoàn tất thanh toán cọc. Lịch của bạn đã được chốt thành công.</p>
      <p><strong>Mã booking:</strong> ${booking.id}</p>
      <p><strong>Dịch vụ:</strong> ${booking.projectType}</p>
      <p><strong>Ngày quay:</strong> ${booking.bookingDate.day}/${booking.bookingDate.month + 1}/${booking.bookingDate.year}</p>
      <p><strong>Số tiền cọc:</strong> ${formatCurrency(payment.amountToPay)}</p>
      <p><strong>Thanh toán lúc:</strong> ${payment.paidAt ? new Date(payment.paidAt).toLocaleString('vi-VN') : 'N/A'}</p>
      <br>
      <p>Đội ngũ Shooting Center sẽ liên hệ để xác nhận chi tiết triển khai.</p>
      <br>
      <p>Trân trọng,<br>Shooting Team</p>
    `
  });
}

async function sendBookingConfirmedNotification(booking, payment) {
  const [adminResult, customerResult] = await Promise.allSettled([
    sendBookingConfirmedToAdmin(booking, payment),
    sendBookingConfirmedToCustomer(booking, payment)
  ]);

  if (adminResult.status === 'rejected') {
    throw adminResult.reason;
  }

  if (customerResult.status === 'rejected') {
    throw customerResult.reason;
  }
}

module.exports = {
  sendContactNotification,
  sendBookingNotification,
  sendPaymentConfirmation,
  sendBookingConfirmedNotification
};
