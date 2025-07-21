const redis = require('redis');

const redisClient = redis.createClient({
  url: 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.log('Error de Redis:', err));
redisClient.connect();

module.exports = redisClient;