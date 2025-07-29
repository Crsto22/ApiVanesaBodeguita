# API Vanesa Bodeguita - Fly.io

API REST optimizada para la bodeguita de Vanesa, diseñada para minimizar costos de Firestore mediante un sistema de caché inteligente.

## � Configuración Segura

⚠️ **IMPORTANTE**: Esta API usa **SOLO variables de entorno** para las credenciales de Firebase. **NUNCA** se suben archivos JSON con credenciales al repositorio.

### Configuración para Desarrollo:
1. Copia `.env.example` como `.env`
2. Completa `FIREBASE_SERVICE_ACCOUNT_KEY` con tu JSON de Firebase
3. El archivo `.env` está en `.gitignore` y NO se sube a GitHub

### Configuración para Producción (Fly.io):
Usa los secrets de Fly.io (ver sección de Deploy)

## �🚀 Características

- **Caché inteligente**: Reduce las consultas a Firestore hasta en un 95%
- **6 APIs optimizadas**: Productos, búsqueda, categorías, grupos, etc.
- **Costos mínimos**: Diseñada para el plan gratuito de Fly.io
- **Alta performance**: Respuestas en milisegundos gracias al caché en memoria
- **Escalable**: Fácil de escalar cuando sea necesario
- **Seguridad**: Credenciales manejadas solo por variables de entorno

## 📋 APIs Disponibles

### Productos
- `GET /api/productos` - Todos los productos
- `GET /api/productos/inicio` - Productos agrupados para página de inicio
- `GET /api/productos/grupo` - Productos paginados por grupo/categoría
- `GET /api/productos/buscar` - Búsqueda de productos
- `GET /api/productos/:id` - Producto específico con relacionados

### Categorías
- `GET /api/categorias` - Todas las categorías
- `GET /api/categorias/:id` - Categoría específica

### Caché
- `GET /api/cache/stats` - Estadísticas del caché
- `DELETE /api/cache/clear` - Limpiar todo el caché
- `POST /api/cache/refresh` - Refrescar caché

### Utilidades
- `GET /health` - Health check

## 🛠️ Instalación Local

1. **Clonar e instalar dependencias**:
```bash
cd ApiVanesaBodeguita
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

3. **Configurar Firebase**:
   - Descargar las credenciales de Firebase
   - Configurar en `.env` la ruta o el JSON completo

4. **Ejecutar en desarrollo**:
```bash
npm run dev
```

5. **Ejecutar en producción**:
```bash
npm start
```

## 🚀 Deploy en Fly.io

### Prerequisitos
- Instalar [Fly CLI](https://fly.io/docs/getting-started/installing-flyctl/)
- Crear cuenta en Fly.io

### Pasos de despliegue

1. **Login en Fly.io**:
```bash
fly auth login
```

2. **Crear la aplicación**:
```bash
fly launch
```

3. **Configurar secretos de Firebase**:
```bash
# Opción 1: Archivo de credenciales (para desarrollo)
fly secrets set FIREBASE_SERVICE_ACCOUNT_KEY="$(cat path/to/service-account.json)"

# Opción 2: Variables específicas (recomendado para producción)
fly secrets set FIREBASE_PROJECT_ID="negociovanesa"
```

4. **Desplegar**:
```bash
fly deploy
```

5. **Verificar**:
```bash
fly status
fly logs
```

## 💰 Costos Estimados

### Fly.io (Plan Gratuito)
- **Recursos**: 256MB RAM, CPU compartida
- **Costo**: $0/mes para tu tráfico
- **Incluye**: 3 aplicaciones gratuitas

### Firestore
- **Sin caché**: ~$30-50/mes (500 productos × 50 requests/hora)
- **Con caché**: ~$1-3/mes (reducción del 95% en consultas)

## 🔧 Configuración de Grupos

Los productos se organizan automáticamente en grupos según su categoría:

- **Alimentos Frescos**: Carnes, Frutas, Verduras, Lácteos y huevos
- **Bebidas**: Bebidas, Gaseosas, Alcohólicas, Café e infusiones
- **Abarrotes**: Abarrotes, Harinas, Fideos, Enlatados, Aceites
- **Snacks y Dulces**: Snacks, Cereales, Chocolates, Dulces, Galletas
- **Cuidado Personal y Limpieza**
- **Panadería y Embutidos**
- **Útiles Escolares**
- **Alimentos para Animales**
- **Gas y Licorería**

## ⚡ Sistema de Caché

- **TTL**: 3 horas por defecto
- **Estructura inteligente**: Productos pre-agrupados y organizados
- **Auto-limpieza**: Elimina entradas expiradas cada 30 minutos
- **Estadísticas**: Monitoreo en tiempo real del caché

## 🔒 Seguridad

- Helmet.js para headers de seguridad
- CORS configurado
- Rate limiting (opcional)
- Variables de entorno para credenciales

## 📊 Monitoreo

- Health checks automáticos
- Logs estructurados
- Métricas de caché
- Uptime monitoring

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear un Pull Request

## 📝 Licencia

ISC License - ver archivo LICENSE para detalles
