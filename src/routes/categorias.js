const express = require('express');
const { db } = require('../config/firebase');
const redisClient = require('../services/cache');
const { collection, getDocs, doc, getDoc } = require('firebase/firestore');

const router = express.Router();

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'categorias:todas';
    
    // Intentar obtener datos desde Redis
    const cachedCategorias = await redisClient.get(cacheKey);
    if (cachedCategorias) {
      console.log('Respondiendo con categorías desde la caché.');
      return res.json(JSON.parse(cachedCategorias));
    }

    // Si no están en caché, consultar Firestore
    console.log('Consultando categorías desde Firestore...');
    const categoriasSnapshot = await getDocs(collection(db, 'categorias'));
    const categorias = categoriasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Almacenar en Redis con expiración de 1 hora (3600 segundos)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(categorias));
    console.log('Categorías desde Firestore, almacenadas en caché.');
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Obtener una categoría por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `categoria:${id}`;

    // Intentar obtener desde Redis
    const cachedCategoria = await redisClient.get(cacheKey);
    if (cachedCategoria) {
      console.log('Respondiendo con categoría desde la caché.');
      return res.json(JSON.parse(cachedCategoria));
    }

    // Si no está en caché, consultar Firestore
    console.log(`Consultando categoría ${id} desde Firestore...`);
    const categoriaDoc = await getDoc(doc(db, 'categorias', id));
    if (!categoriaDoc.exists()) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const categoria = { id: categoriaDoc.id, ...categoriaDoc.data() };

    // Almacenar en Redis con expiración de 1 hora
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(categoria));
    console.log('Categoría desde Firestore, almacenada en caché.');
    res.json(categoria);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Limpiar caché (esto limpiará TODA la caché, ten cuidado)
router.post('/clear-cache', async (req, res) => {
  try {
    await redisClient.flushAll();
    console.log('Caché de Redis limpiada.');
    res.json({ message: 'Toda la caché de Redis ha sido limpiada.' });
  } catch (error) {
    console.error('Error al limpiar caché:', error);
    res.status(500).json({ error: 'Error al limpiar caché' });
  }
});

module.exports = router;
