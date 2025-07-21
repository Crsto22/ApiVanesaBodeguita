console.log('[DEBUG] El valor de REDIS_URL es:', process.env.REDIS_URL);
const express = require('express');
const productosRouter = require('./routes/productos');
const categoriasRouter = require('./routes/categorias');

const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Montar rutas
app.use('/productos', productosRouter);
app.use('/categorias', categoriasRouter);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
