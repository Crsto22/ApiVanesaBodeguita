const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379', // Fallback para pruebas locales
});

redisClient.on('error', (err) => console.log('Error de Redis:', err));
redisClient.connect();

module.exports = redisClient;