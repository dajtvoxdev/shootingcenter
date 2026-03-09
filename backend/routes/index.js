const express = require('express');

const bookingRoutes = require('./booking.routes');
const contactRoutes = require('./contact.routes');
const paymentRoutes = require('./payment.routes');
const webhookRoutes = require('./webhook.routes');
const contentRoutes = require('./content.routes');

const router = express.Router();

router.use('/bookings', bookingRoutes);
router.use('/contacts', contactRoutes);
router.use('/payments', paymentRoutes);
router.use('/webhook', webhookRoutes);
router.use('/content', contentRoutes);

module.exports = router;
