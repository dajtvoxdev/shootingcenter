const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { validateBody } = require('../middleware/validator');

const router = express.Router();

router.post(
  '/create',
  validateBody(['customerInfo', 'services', 'paymentMethod', 'paymentType']),
  paymentController.createPayment
);

router.get('/:id/status', paymentController.getPaymentStatus);

module.exports = router;
