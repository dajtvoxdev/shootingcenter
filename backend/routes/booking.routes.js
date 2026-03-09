const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { validateBody } = require('../middleware/validator');

const router = express.Router();

router.post(
  '/',
  validateBody([
    'service',
    'projectType',
    'budget',
    'conceptStatus',
    'bookingDate',
    'phoneNumber'
  ]),
  bookingController.createBooking
);

router.get('/booked-dates/:year/:month', bookingController.getBookedDatesByMonth);
router.get('/:id', bookingController.getBookingById);

module.exports = router;
