const express = require('express');
const { db } = require('../config/firebase');
const redisClient = require('../services/cache');
const { collection, getDocs, doc, getDoc } = require('firebase/firestore');

const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'productos:todos';
    
    // Intentar obtener datos desde Redis
    const cachedProductos = await redisClient.get(cacheKey);
    if (cachedProductos) {
      console.log('Respondiendo con productos desde la caché.');
      return res.json(JSON.parse(cachedProductos));
    }

    // Si no están en caché, consultar Firestore
    console.log('Consultando productos desde Firestore...');
    const productosSnapshot = await getDocs(collection(db, 'productos'));
    const productos = productosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Almacenar en Redis con expiración de 1 hora (3600 segundos)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(productos));
    console.log('Productos desde Firestore, almacenados en caché.');
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `producto:${id}`;

    // Intentar obtener desde Redis
    const cachedProducto = await redisClient.get(cacheKey);
    if (cachedProducto) {
      console.log('Respondiendo con producto desde la caché.');
      return res.json(JSON.parse(cachedProducto));
    }

    // Si no está en caché, consultar Firestore
    console.log(`Consultando producto ${id} desde Firestore...`);
    const productoDoc = await getDoc(doc(db, 'productos', id));
    if (!productoDoc.exists()) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = { id: productoDoc.id, ...productoDoc.data() };

    // Almacenar en Redis con expiración de 1 hora
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(producto));
    console.log('Producto desde Firestore, almacenado en caché.');
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
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
