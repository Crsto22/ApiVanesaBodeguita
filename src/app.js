// Este log es clave para la depuración en Railway
console.log('[DEBUG] Leyendo process.env.REDIS_URL:', process.env.REDIS_URL);

const express = require('express');
const categoriasRouter = require('./routes/categorias');
// const productosRouter = require('./routes/productos'); // Descomenta cuando lo tengas listo

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Montar rutas
app.use('/api/categorias', categoriasRouter);
// app.use('/api/productos', productosRouter); // Es buena práctica usar un prefijo como /api

// Ruta de bienvenida para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.send('API de Bodeguita Vanesa funcionando!');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
