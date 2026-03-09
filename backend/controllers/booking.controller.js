const storageService = require('../services/storage.service');
const { generateEntityId } = require('../utils/id-generator');

function isValidBookingDate(bookingDate) {
  if (!bookingDate || typeof bookingDate !== 'object') return false;
  const { day, month, year } = bookingDate;
  return (
    Number.isInteger(day) &&
    Number.isInteger(month) &&
    Number.isInteger(year) &&
    day >= 1 &&
    day <= 31 &&
    month >= 1 &&
    month <= 12 &&
    year >= 2000
  );
}

async function createBooking(req, res, next) {
  try {
    const payload = req.body;

    if (!isValidBookingDate(payload.bookingDate)) {
      return res.status(400).json({ success: false, error: 'bookingDate is invalid' });
    }

    const id = generateEntityId('BK', storageService.getBookings());
    const now = new Date().toISOString();

    const booking = {
      id,
      service: payload.service,
      projectType: payload.projectType,
      duration: payload.duration || null,
      budget: payload.budget,
      conceptStatus: payload.conceptStatus,
      bookingDate: payload.bookingDate,
      phoneNumber: payload.phoneNumber,
      status: 'pending_payment',
      paymentId: null,
      createdAt: now,
      updatedAt: now
    };

    storageService.addBooking(booking);

    const depositAmount = Math.round((Number(payload?.budget?.min) || 0) * 0.25);

    return res.status(201).json({
      success: true,
      data: {
        bookingId: booking.id,
        status: booking.status,
        createdAt: booking.createdAt,
        depositAmount
      }
    });
  } catch (error) {
    return next(error);
  }
}

function getBookingById(req, res, next) {
  try {
    const booking = storageService.findBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'booking not found' });
    }

    return res.json({ success: true, data: booking });
  } catch (error) {
    return next(error);
  }
}

function getBookedDatesByMonth(req, res, next) {
  try {
    const year = parseInt(req.params.year, 10);
    const month = parseInt(req.params.month, 10);

    if (Number.isNaN(year) || Number.isNaN(month)) {
      return res.status(400).json({ success: false, error: 'year/month is invalid' });
    }

    const bookedDates = storageService.getBookedDates(year, month);

    return res.json({
      success: true,
      data: { bookedDates }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createBooking,
  getBookedDatesByMonth,
  getBookingById
};
