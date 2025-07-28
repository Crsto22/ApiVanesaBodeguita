// Sistema de caché en memoria con TTL
const cache = new Map();

/**
 * Obtiene un valor del caché si existe y no ha expirado
 * @param {string} key - Clave del caché
 * @returns {any | null} - Valor cacheado o null
 */
function getCache(key) {
  const data = cache.get(key);
  
  if (!data) {
    return null;
  }

  // Verificar si el caché ha expirado
  if (Date.now() > data.expiry) {
    console.log(`⏰ Caché para '${key}' expirado. Eliminando.`);
    cache.delete(key);
    return null;
  }

  console.log(`✅ Caché HIT para '${key}'`);
  return data.value;
}

/**
 * Guarda un valor en el caché con TTL
 * @param {string} key - Clave del caché
 * @param {any} value - Valor a guardar
 * @param {number} ttlMs - Tiempo de vida en milisegundos
 */
function setCache(key, value, ttlMs = 3 * 60 * 60 * 1000) { // 3 horas por defecto
  console.log(`💾 Guardando en caché '${key}' por ${ttlMs / 1000} segundos`);
  
  cache.set(key, {
    value,
    expiry: Date.now() + ttlMs,
    createdAt: Date.now()
  });
}

/**
 * Elimina una entrada específica del caché
 * @param {string} key - Clave a eliminar
 */
function deleteCache(key) {
  const deleted = cache.delete(key);
  if (deleted) {
    console.log(`🗑️ Caché eliminado para '${key}'`);
  }
  return deleted;
}

/**
 * Limpia todo el caché
 */
function clearCache() {
  const size = cache.size;
  cache.clear();
  console.log(`🧹 Caché limpio. ${size} entradas eliminadas.`);
}

/**
 * Obtiene estadísticas del caché
 */
function getCacheStats() {
  const stats = {
    totalEntries: cache.size,
    entries: []
  };

  for (const [key, data] of cache.entries()) {
    const isExpired = Date.now() > data.expiry;
    const ageMs = Date.now() - data.createdAt;
    const ttlMs = data.expiry - data.createdAt;
    
    stats.entries.push({
      key,
      isExpired,
      ageSeconds: Math.floor(ageMs / 1000),
      ttlSeconds: Math.floor(ttlMs / 1000),
      sizeEstimate: JSON.stringify(data.value).length
    });
  }

  return stats;
}

/**
 * Limpia entradas expiradas del caché
 */
function cleanExpiredCache() {
  let cleaned = 0;
  const now = Date.now();
  
  for (const [key, data] of cache.entries()) {
    if (now > data.expiry) {
      cache.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 ${cleaned} entradas expiradas eliminadas del caché`);
  }
  
  return cleaned;
}

// Limpiar caché expirado cada 30 minutos
setInterval(cleanExpiredCache, 30 * 60 * 1000);

module.exports = {
  getCache,
  setCache,
  deleteCache,
  clearCache,
  getCacheStats,
  cleanExpiredCache
};
