const storageService = require('../services/storage.service');
const sepayService = require('../services/sepay.service');
const { toTransactionCode } = require('../utils/id-generator');

function calculateTotal(services) {
  if (!Array.isArray(services)) return 0;
  return services.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
}

function isValidCustomerInfo(customerInfo) {
  return (
    customerInfo &&
    typeof customerInfo.fullName === 'string' &&
    typeof customerInfo.email === 'string' &&
    typeof customerInfo.phone === 'string'
  );
}

function generatePaymentId(payments = []) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const dateKey = `${yyyy}${mm}${dd}`;

  const usedTransactionCodes = new Set(
    payments
      .map((item) => String(item?.transactionCode || '').trim())
      .filter(Boolean)
  );
  const usedIds = new Set(
    payments
      .map((item) => String(item?.id || '').trim())
      .filter(Boolean)
  );

  let sequence = 1;
  while (true) {
    const candidate = `PAY${dateKey}${String(sequence).padStart(3, '0')}`;
    if (!usedIds.has(candidate) && !usedTransactionCodes.has(candidate)) {
      return candidate;
    }
    sequence += 1;
  }
}

async function createPayment(req, res, next) {
  try {
    const payload = req.body;

    if (!isValidCustomerInfo(payload.customerInfo)) {
      return res.status(400).json({ success: false, error: 'customerInfo is invalid' });
    }

    const allPayments = storageService.getPayments();
    const paymentId = generatePaymentId(allPayments);
    const transactionCode = toTransactionCode(paymentId);
    const booking = payload.bookingId ? storageService.findBookingById(payload.bookingId) : null;

    if (payload.bookingId && !booking) {
      return res.status(404).json({ success: false, error: 'booking not found' });
    }

    let services = Array.isArray(payload.services) ? payload.services : [];
    let total = calculateTotal(services);

    if (booking) {
      const bookingBudgetMin = Number(booking?.budget?.min) || 0;
      if (bookingBudgetMin > 0) {
        total = bookingBudgetMin;
      }

      if (services.length === 0) {
        services = [{
          name: `Booking ${booking.projectType || booking.service || booking.id}`,
          price: total
        }];
      }
    }

    if (total <= 0) {
      return res.status(400).json({ success: false, error: 'services total must be greater than 0' });
    }

    const isDeposit = payload.paymentType === 'deposit';
    const depositRate = isDeposit ? 0.25 : 1;
    const amountToPay = isDeposit ? Math.round(total * depositRate) : total;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString();
    const qrCodeUrl = payload.paymentMethod === 'bank'
      ? sepayService.generateQRCodeUrl(transactionCode, amountToPay)
      : null;

    const payment = {
      id: paymentId,
      bookingId: payload.bookingId || null,
      customerInfo: payload.customerInfo,
      services,
      total,
      depositRate,
      amountToPay,
      paymentMethod: payload.paymentMethod,
      paymentType: payload.paymentType,
      transactionCode,
      qrCodeUrl,
      status: 'pending',
      sepayTransaction: null,
      sendEmailConfirmation: Boolean(payload.sendEmailConfirmation),
      emailSent: false,
      createdAt: now.toISOString(),
      expiresAt,
      paidAt: null
    };

    storageService.addPayment(payment);

    if (payment.bookingId) {
      storageService.updateBooking(payment.bookingId, {
        paymentId: payment.id
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        paymentId: payment.id,
        amount: payment.amountToPay,
        qrCodeUrl: payment.qrCodeUrl,
        transactionCode: payment.transactionCode,
        expiresAt: payment.expiresAt,
        status: payment.status
      }
    });
  } catch (error) {
    return next(error);
  }
}

function getPaymentStatus(req, res, next) {
  try {
    const paymentId = req.params.id;
    const payment = storageService.findPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, error: 'payment not found' });
    }

    return res.json({
      success: true,
      data: {
        paymentId: payment.id,
        status: payment.status,
        paidAt: payment.paidAt
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createPayment,
  getPaymentStatus
};
