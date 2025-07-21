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
    let productos = await redisClient.get(cacheKey);
    if (productos) {
      console.log('Productos desde caché');
      return res.json(JSON.parse(productos));
    }

    // Si no están en caché, consultar Firestore
    const productosSnapshot = await getDocs(collection(db, 'productos'));
    productos = productosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Almacenar en Redis con expiración de 1 hora (3600 segundos)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(productos));
    console.log('Productos desde Firestore, almacenados en caché');
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `producto:${id}`;

    // Intentar obtener desde Redis
    let producto = await redisClient.get(cacheKey);
    if (producto) {
      console.log('Producto desde caché');
      return res.json(JSON.parse(producto));
    }

    // Si no está en caché, consultar Firestore
    const productoDoc = await getDoc(doc(db, 'productos', id));
    if (!productoDoc.exists()) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    producto = { id: productoDoc.id, ...productoDoc.data() };

    // Almacenar en Redis con expiración de 1 hora
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(producto));
    console.log('Producto desde Firestore, almacenado en caché');
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Limpiar caché
router.post('/clear-cache', async (req, res) => {
  try {
    await redisClient.flushAll();
    res.json({ message: 'Caché de productos limpiado' });
  } catch (error) {
    console.error('Error al limpiar caché:', error);
    res.status(500).json({ error: 'Error al limpiar caché' });
  }
});

module.exports = router;