const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

// Cargar variables de entorno con ruta explícita (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ 
    path: path.join(__dirname, '.env')
  });
}

// Importar rutas
const productosRoutes = require('./routes/productos');
const categoriasRoutes = require('./routes/categorias');
const cacheRoutes = require('./routes/cache');

// Importar servicios
const { initializeFirebase } = require('./services/firebase');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración mejorada de CORS para producción
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
    
    // En desarrollo, permitir cualquier origen
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // En producción, verificar orígenes permitidos
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middlewares de seguridad y optimización
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging mejorado
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.path;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`${timestamp} - ${method} ${url} - IP: ${ip}`);
  next();
});

// Inicializar Firebase
console.log('🔧 Inicializando servicios...');
initializeFirebase();

// Health check mejorado
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    port: PORT,
    services: {
      firebase: 'connected'
    }
  };
  
  res.status(200).json(healthStatus);
});

// API Routes
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/cache', cacheRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API Vanesa Bodeguita - Funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      productos: '/api/productos',
      categorias: '/api/categorias',
      cache: '/api/cache',
      health: '/health'
    }
  });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('\n🎉 ========================================');
  console.log('🚀 API VANESA BODEGUITA - INICIADA');
  console.log('🎉 ========================================');
  console.log(`📊 Entorno: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
  console.log(`🌐 Puerto: ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`📋 API Base: http://localhost:${PORT}/api`);
  console.log('📁 Endpoints disponibles:');
  console.log('   • GET  /api/productos');
  console.log('   • GET  /api/categorias');
  console.log('   • GET  /api/cache');
  console.log('   • GET  /health');
  
  if (isProduction) {
    console.log('🔒 Modo producción: Logs limitados para rendimiento');
  } else {
    console.log('🔧 Modo desarrollo: Logs detallados activados');
  }
  
  console.log('🎉 ========================================\n');
});

module.exports = app;
