const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://default:kXtffHElUGkLOVgnfSVezxsIEetmQxGt@redis.railway.internal:6379', // Fallback para pruebas locales
});

// Manejo de errores detallado
redisClient.on('error', (err) => {
  console.error('Error de Redis:', err.message);
  console.error('Detalles del error:', {
    code: err.code,
    syscall: err.syscall,
    address: err.address,
    port: err.port,
  });
});

// Evento para confirmar conexión exitosa
redisClient.on('connect', () => {
  console.log('Conectado a Redis en:', process.env.REDIS_URL || 'redis://localhost:6379');
});

// Conectar al iniciar
redisClient.connect().catch((err) => {
  console.error('Error al conectar a Redis:', err.message);
});

module.exports = redisClient;
