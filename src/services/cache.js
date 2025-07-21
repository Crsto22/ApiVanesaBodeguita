const redis = require('redis');

// Esta línea ahora depende 100% de la variable de entorno de Railway.
// Si REDIS_URL no está definida, la aplicación fallará al iniciar,
// lo cual es bueno porque te avisa de un error de configuración.
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Error de Redis:', err.message);
});

redisClient.on('connect', () => {
  // El log te mostrará la URL interna de Railway
  console.log('Conectado exitosamente a Redis en Railway.');
});

redisClient.connect().catch(console.error);

module.exports = redisClient;
