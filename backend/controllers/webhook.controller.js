const storageService = require('../services/storage.service');
const emailService = require('../services/email.service');

async function handleSepayWebhook(req, res, next) {
  try {
    const payload = req.body || {};
    const { content, transferAmount, transferType } = payload;

    if (transferType !== 'in') {
      return res.json({ success: true });
    }

    const payment = storageService.findPaymentByTransactionCode(String(content || '').trim());

    if (!payment) {
      return res.json({ success: true });
    }

    if (payment.status === 'paid') {
      return res.json({ success: true });
    }

    if (Number(transferAmount) < Number(payment.amountToPay)) {
      return res.json({ success: true });
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

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  handleSepayWebhook
};
