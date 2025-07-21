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
    let categorias = await redisClient.get(cacheKey);
    if (categorias) {
      console.log('Categorías desde caché');
      return res.json(JSON.parse(categorias));
    }

    // Si no están en caché, consultar Firestore
    const categoriasSnapshot = await getDocs(collection(db, 'categorias'));
    categorias = categoriasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Almacenar en Redis con expiración de 1 hora (3600 segundos)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(categorias));
    console.log('Categorías desde Firestore, almacenadas en caché');
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Obtener una categoría por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `categoria:${id}`;

    // Intentar obtener desde Redis
    let categoria = await redisClient.get(cacheKey);
    if (categoria) {
      console.log('Categoría desde caché');
      return res.json(JSON.parse(categoria));
    }

    // Si no está en caché, consultar Firestore
    const categoriaDoc = await getDoc(doc(db, 'categorias', id));
    if (!categoriaDoc.exists()) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    categoria = { id: categoriaDoc.id, ...categoriaDoc.data() };

    // Almacenar en Redis con expiración de 1 hora
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(categoria));
    console.log('Categoría desde Firestore, almacenada en caché');
    res.json(categoria);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
});

// Limpiar caché
router.post('/clear-cache', async (req, res) => {
  try {
    await redisClient.flushAll();
    res.json({ message: 'Caché de categorías limpiado' });
  } catch (error) {
    console.error('Error al limpiar caché:', error);
    res.status(500).json({ error: 'Error al limpiar caché' });
  }
});

module.exports = router;