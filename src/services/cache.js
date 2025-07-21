const redis = require('redis');

// Asegúrate de que la variable de entorno REDIS_URL está disponible.
if (!process.env.REDIS_URL) {
  throw new Error('La variable de entorno REDIS_URL no está definida.');
}

// Crear el cliente de Redis usando la URL de Railway.
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Error de Redis:', err.message);
});

redisClient.on('connect', () => {
  console.log('Conectado exitosamente a Redis en Railway.');
});

// Intentar conectar al iniciar la aplicación.
redisClient.connect().catch((err) => {
    console.error('Fallo crítico al conectar con Redis:', err);
    // En un entorno de producción, podrías querer que la aplicación se detenga si Redis es esencial.
    // process.exit(1); 
});

module.exports = redisClient;
