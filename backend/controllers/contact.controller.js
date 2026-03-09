const storageService = require('../services/storage.service');
const emailService = require('../services/email.service');
const { generateEntityId } = require('../utils/id-generator');

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function createContact(req, res, next) {
  try {
    const payload = req.body;

    if (!isValidEmail(payload.email || '')) {
      return res.status(400).json({ success: false, error: 'email is invalid' });
    }

    const contact = {
      id: generateEntityId('CT', storageService.getContacts()),
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      status: 'new',
      createdAt: new Date().toISOString()
    };

    storageService.addContact(contact);

    emailService.sendContactNotification(contact).catch((err) => {
      console.error('sendContactNotification failed:', err.message);
    });

    return res.status(201).json({
      success: true,
      data: {
        contactId: contact.id,
        message: 'Cảm ơn bạn đã liên hệ!'
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createContact
};
