function getTodayKey() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function generateEntityId(prefix, entities = []) {
  const todayKey = getTodayKey();
  const todayPrefix = `${prefix}-${todayKey}-`;
  const todayCount = entities.filter((item) => typeof item.id === 'string' && item.id.startsWith(todayPrefix)).length;
  const sequence = String(todayCount + 1).padStart(3, '0');
  return `${todayPrefix}${sequence}`;
}

function toTransactionCode(entityId) {
  return String(entityId).replace(/-/g, '');
}

module.exports = {
  generateEntityId,
  toTransactionCode
};
