const express = require('express');
const webhookController = require('../controllers/webhook.controller');
const sepayAuth = require('../middleware/sepay-auth');

const router = express.Router();

router.post('/sepay', sepayAuth, webhookController.handleSepayWebhook);

module.exports = router;
