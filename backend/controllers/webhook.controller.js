const storageService = require('../services/storage.service');
const emailService = require('../services/email.service');

function collectCandidateTransactionCodes(payload) {
  const candidates = new Set();
  const directValues = [payload.code, payload.content, payload.description, payload.referenceCode];

  for (const value of directValues) {
    const normalized = String(value || '').trim();
    if (normalized) {
      candidates.add(normalized);
    }

    const matches = normalized.match(/PAY\d+/g) || [];
    for (const match of matches) {
      candidates.add(match.trim());
    }
  }

  return Array.from(candidates);
}

async function handleSepayWebhook(req, res, next) {
  try {
    const payload = req.body || {};
    const { transferAmount, transferType } = payload;

    if (transferType !== 'in') {
      return res.json({
        success: true,
        message: 'Webhook ignored: transferType is not "in".',
        debug: {
          transferType
        }
      });
    }

    const candidateTransactionCodes = collectCandidateTransactionCodes(payload);
    const matchedTransactionCode = candidateTransactionCodes.find((code) =>
      storageService.findPaymentByTransactionCode(code)
    );
    const payment = matchedTransactionCode
      ? storageService.findPaymentByTransactionCode(matchedTransactionCode)
      : null;

    if (!payment) {
      return res.json({
        success: true,
        message: 'Webhook ignored: no payment found for transaction code.',
        debug: {
          candidates: candidateTransactionCodes
        }
      });
    }

    if (payment.status === 'paid') {
      return res.json({
        success: true,
        message: 'Webhook ignored: payment is already marked as paid.',
        debug: {
          matchedTransactionCode,
          paymentId: payment.id,
          paymentStatus: payment.status
        }
      });
    }

    if (Number(transferAmount) < Number(payment.amountToPay)) {
      return res.json({
        success: true,
        message: 'Webhook ignored: transfer amount is less than required amount.',
        debug: {
          matchedTransactionCode,
          paymentId: payment.id,
          transferAmount: Number(transferAmount),
          amountToPay: Number(payment.amountToPay)
        }
      });
    }

    const paidAt = new Date().toISOString();
    const updatedPayment = storageService.updatePayment(payment.id, {
      status: 'paid',
      paidAt,
      sepayTransaction: payload
    });

    if (payment.bookingId) {
      const booking = storageService.findBookingById(payment.bookingId);
      if (booking) {
        const confirmedBooking = storageService.updateBooking(payment.bookingId, {
          status: 'confirmed',
          paymentId: payment.id
        });

        const { bookingDate } = booking;
        if (bookingDate) {
          storageService.addBookedDate(bookingDate.year, bookingDate.month, bookingDate.day);
        }

        emailService
          .sendBookingConfirmedNotification(confirmedBooking || booking, updatedPayment)
          .catch((err) => {
            console.error('sendBookingConfirmedNotification failed:', err.message);
          });
      }
    }

    if (updatedPayment && updatedPayment.sendEmailConfirmation && !updatedPayment.emailSent) {
      emailService
        .sendPaymentConfirmation(updatedPayment)
        .then(() => {
          storageService.updatePayment(updatedPayment.id, { emailSent: true });
        })
        .catch((err) => {
          console.error('sendPaymentConfirmation failed:', err.message);
        });
    }

    return res.json({
      success: true,
      message: 'Webhook processed successfully.',
      debug: {
        matchedTransactionCode,
        paymentId: payment.id,
        bookingId: payment.bookingId || null,
        paidAt
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  handleSepayWebhook
};
