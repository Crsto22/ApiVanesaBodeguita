const express = require('express');
const router = express.Router();
const { getFirestore } = require('../services/firebase');
const { getCache, setCache } = require('../services/cache');

const TRES_HORAS_EN_MS = 3 * 60 * 60 * 1000;

/**
 * Función para obtener y cachear categorías
 */
async function fetchAndCacheCategorias() {
  console.log('🔥 Obteniendo categorías desde Firestore');
  
  const db = getFirestore();
  const snapshot = await db.collection('categorias').where('estado', '==', 'activo').get();
  
  const categorias = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const categoriasData = {
    categorias,
    total: categorias.length,
    lastUpdated: new Date().toISOString()
  };

  setCache('cache_de_categorias', categoriasData, TRES_HORAS_EN_MS);
  return categoriasData;
}

/**
 * GET /api/categorias
 * Obtiene todas las categorías activas
 */
router.get('/', async (req, res) => {
  try {
    let categoriasCache = getCache('cache_de_categorias');
    if (!categoriasCache) {
      categoriasCache = await fetchAndCacheCategorias();
    }

    res.json({
      success: true,
      data: categoriasCache.categorias,
      total: categoriasCache.total,
      lastUpdated: categoriasCache.lastUpdated
    });
  } catch (error) {
    console.error('❌ Error en GET /categorias:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías',
      message: error.message
    });
  }
});

/**
 * GET /api/categorias/:id
 * Obtiene una categoría específica por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let categoriasCache = getCache('cache_de_categorias');
    if (!categoriasCache) {
      categoriasCache = await fetchAndCacheCategorias();
    }

    const categoria = categoriasCache.categorias.find(cat => cat.id === id);
    
    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: categoria,
      lastUpdated: categoriasCache.lastUpdated
    });
  } catch (error) {
    console.error(`❌ Error en GET /categorias/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categoría',
      message: error.message
    });
  }
});

module.exports = router;
