const express = require('express');
const contentController = require('../controllers/content.controller');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/equipment', contentController.getEquipmentCatalog);
router.get('/service-config', contentController.getServiceConfig);
router.post('/equipment', upload.single('image'), contentController.createEquipmentItem);

module.exports = router;

