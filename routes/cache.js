const express = require('express');
const router = express.Router();
const { getCacheStats, clearCache, deleteCache, cleanExpiredCache } = require('../services/cache');

/**
 * GET /api/cache/stats
 * Obtiene estadísticas del caché
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getCacheStats();
    
    res.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    });
  } catch (error) {
    console.error('❌ Error en GET /cache/stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas del caché',
      message: error.message
    });
  }
});

/**
 * DELETE /api/cache/clear
 * Limpia todo el caché
 */
router.delete('/clear', (req, res) => {
  try {
    clearCache();
    
    res.json({
      success: true,
      message: 'Caché limpiado completamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en DELETE /cache/clear:', error);
    res.status(500).json({
      success: false,
      error: 'Error al limpiar el caché',
      message: error.message
    });
  }
});

/**
 * DELETE /api/cache/:key
 * Elimina una entrada específica del caché
 */
router.delete('/:key', (req, res) => {
  try {
    const { key } = req.params;
    const deleted = deleteCache(key);
    
    if (deleted) {
      res.json({
        success: true,
        message: `Entrada '${key}' eliminada del caché`,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        message: `Entrada '${key}' no encontrada en el caché`
      });
    }
  } catch (error) {
    console.error(`❌ Error en DELETE /cache/${req.params.key}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar entrada del caché',
      message: error.message
    });
  }
});

/**
 * POST /api/cache/clean
 * Limpia entradas expiradas del caché
 */
router.post('/clean', (req, res) => {
  try {
    const cleaned = cleanExpiredCache();
    
    res.json({
      success: true,
      message: `${cleaned} entradas expiradas eliminadas`,
      cleanedEntries: cleaned,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error en POST /cache/clean:', error);
    res.status(500).json({
      success: false,
      error: 'Error al limpiar entradas expiradas',
      message: error.message
    });
  }
});

/**
 * POST /api/cache/refresh
 * Refresca el caché (elimina entradas para forzar recarga)
 */
router.post('/refresh', (req, res) => {
  try {
    const { keys } = req.body;
    
    if (keys && Array.isArray(keys)) {
      // Refrescar claves específicas
      let refreshed = 0;
      keys.forEach(key => {
        if (deleteCache(key)) {
          refreshed++;
        }
      });
      
      res.json({
        success: true,
        message: `${refreshed} entradas refrescadas`,
        refreshedKeys: keys.filter(key => deleteCache(key)),
        timestamp: new Date().toISOString()
      });
    } else {
      // Refrescar todo el caché
      clearCache();
      
      res.json({
        success: true,
        message: 'Todo el caché ha sido refrescado',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Error en POST /cache/refresh:', error);
    res.status(500).json({
      success: false,
      error: 'Error al refrescar el caché',
      message: error.message
    });
  }
});

module.exports = router;
