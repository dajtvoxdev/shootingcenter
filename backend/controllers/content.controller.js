const storageService = require('../services/storage.service');

function toAbsoluteMediaUrl(req, value) {
  if (typeof value !== 'string' || value.length === 0) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (!value.startsWith('/')) return value;
  // Return relative URL - let frontend/Caddy handle the domain
  return value;
}

function getEquipmentCatalog(req, res, next) {
  try {
    const categories = storageService.getEquipmentCategories().map((category) => ({
      ...category,
      icon: toAbsoluteMediaUrl(req, category.icon)
    }));

    const items = storageService.getEquipmentItems().map((item) => ({
      ...item,
      imagePath: toAbsoluteMediaUrl(req, item.imagePath)
    }));

    return res.json({
      success: true,
      data: { categories, items }
    });
  } catch (error) {
    return next(error);
  }
}

function getServiceConfig(req, res, next) {
  try {
    const config = storageService.getServiceConfig();
    const data = {
      ...config,
      galleryImages: Array.isArray(config.galleryImages)
        ? config.galleryImages.map((imagePath) => toAbsoluteMediaUrl(req, imagePath))
        : []
    };

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
}

function createEquipmentItem(req, res, next) {
  try {
    const body = req.body || {};

    if (!body.name || !body.category) {
      return res.status(400).json({ success: false, error: 'name and category are required' });
    }

    const existing = storageService.getEquipmentItems();
    const nextId = existing.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;

    const imagePath = req.file
      ? `/media/uploads/${req.file.filename}`
      : String(body.imagePath || '/media/images/equipment-accessory.png');

    const item = {
      id: nextId,
      name: String(body.name),
      accessories: String(body.accessories || ''),
      category: String(body.category),
      imagePath,
      priceLabel: String(body.priceLabel || 'Liên hệ*'),
      pricePerDay: body.pricePerDay !== undefined && body.pricePerDay !== '' ? Number(body.pricePerDay) : null
    };

    storageService.addEquipmentItem(item);

    return res.status(201).json({
      success: true,
      data: {
        ...item,
        imagePath: toAbsoluteMediaUrl(req, item.imagePath)
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getEquipmentCatalog,
  getServiceConfig,
  createEquipmentItem
};

