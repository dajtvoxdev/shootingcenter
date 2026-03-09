const express = require('express');
const contactController = require('../controllers/contact.controller');
const { validateBody } = require('../middleware/validator');

const router = express.Router();

router.post('/', validateBody(['name', 'email', 'subject', 'message']), contactController.createContact);

module.exports = router;
