const express = require('express');
const router = express.Router();
const { getFirestore } = require('../services/firebase');
const { getCache, setCache } = require('../services/cache');
const { mapeoGrupos, getGrupoPorCategoria, validarCategoriaEnGrupo } = require('../config/grupos');

// Constantes
const TRES_HORAS_EN_MS = 3 * 60 * 60 * 1000;

/**
 * Función para mezclar array (shuffle)
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Función para obtener y cachear productos con estructura inteligente
 */
async function fetchAndCacheProductos() {
  console.log('🔥 PRE-PROCESANDO: Obteniendo productos para caché inteligente');
  
  const db = getFirestore();
  
  const [productosSnapshot, categoriasSnapshot] = await Promise.all([
    db.collection('productos').where('estado', '==', 'activo').get(),
    db.collection('categorias').where('estado', '==', 'activo').get()
  ]);

  // Crear mapas de categorías
  const categoriasList = categoriasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const categoriasMap = new Map(categoriasList.map(cat => [cat.id, cat.nombre]));
  
  // Crear mapa inverso categoría -> grupo
  const categoriaToGroupNameMap = new Map();
  for (const groupName in mapeoGrupos) {
    for (const catName of mapeoGrupos[groupName].categorias) {
      categoriaToGroupNameMap.set(catName, groupName);
    }
  }

  // Procesar productos
  const productosEnriquecidos = [];
  const productosById = new Map();
  const productosByGroupName = new Map();

  for (const doc of productosSnapshot.docs) {
    const productoData = doc.data();
    const nombreCategoria = categoriasMap.get(productoData.categoria_ref) || 'Sin categoría';
    
    const productoCompleto = {
      id: doc.id,
      ...productoData,
      nombre_categoria: nombreCategoria,
    };

    productosEnriquecidos.push(productoCompleto);
    productosById.set(doc.id, productoCompleto);

    // Pre-agrupar el producto
    const groupName = categoriaToGroupNameMap.get(nombreCategoria);
    if (groupName) {
      if (!productosByGroupName.has(groupName)) {
        productosByGroupName.set(groupName, []);
      }
      productosByGroupName.get(groupName).push(productoCompleto);
    }
  }

  // Estructura del caché inteligente
  const smartCacheData = {
    all: productosEnriquecidos,
    byId: productosById,
    byGroupName: productosByGroupName,
    lastUpdated: new Date().toISOString()
  };

  setCache('cache_de_productos', smartCacheData, TRES_HORAS_EN_MS);
  return smartCacheData;
}

/**
 * GET /api/productos
 * Obtiene todos los productos activos
 */
router.get('/', async (req, res) => {
  try {
    let productCache = getCache('cache_de_productos');
    if (!productCache) {
      productCache = await fetchAndCacheProductos();
    }

    res.json({
      success: true,
      data: productCache.all,
      total: productCache.all.length,
      lastUpdated: productCache.lastUpdated
    });
  } catch (error) {
    console.error('❌ Error en GET /productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos',
      message: error.message
    });
  }
});

/**
 * GET /api/productos/inicio
 * Obtiene productos agrupados para la página de inicio
 */
router.get('/inicio', async (req, res) => {
  try {
    let productCache = getCache('cache_de_productos');
    if (!productCache) {
      productCache = await fetchAndCacheProductos();
    }

    const productosPorGrupo = productCache.byGroupName;
    const resultadoFinal = [];

    for (const nombreGrupo in mapeoGrupos) {
      const productosDelGrupo = productosPorGrupo.get(nombreGrupo) || [];
      
      if (productosDelGrupo.length > 0) {
        const productosAleatorios = shuffle(productosDelGrupo).slice(0, 12);
        resultadoFinal.push({
          nombreGrupo: nombreGrupo,
          color: mapeoGrupos[nombreGrupo].color,
          productos: productosAleatorios
        });
      }
    }

    res.json({
      success: true,
      data: resultadoFinal,
      lastUpdated: productCache.lastUpdated
    });
  } catch (error) {
    console.error('❌ Error en GET /productos/inicio:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos de inicio',
      message: error.message
    });
  }
});

/**
 * GET /api/productos/grupo
 * Obtiene productos paginados por grupo/categoría
 */
router.get('/grupo', async (req, res) => {
  try {
    const { nombreGrupo, categoria: nombreCategoria } = req.query;
    const pagina = parseInt(req.query.pagina, 10) || 1;
    const productosPorPagina = parseInt(req.query.limite, 10) || 12;

    let productCache = getCache('cache_de_productos');
    if (!productCache) {
      productCache = await fetchAndCacheProductos();
    }

    let productosAFiltrar;
    let categoriasDelGrupo = null;
    let nombreGrupoRespuesta = 'Todos los Productos';

    if (nombreGrupo) {
      if (!mapeoGrupos[nombreGrupo]) {
        return res.status(404).json({
          success: false,
          error: 'Grupo no encontrado',
          gruposDisponibles: Object.keys(mapeoGrupos)
        });
      }

      nombreGrupoRespuesta = nombreGrupo;
      categoriasDelGrupo = mapeoGrupos[nombreGrupo].categorias;
      productosAFiltrar = productCache.byGroupName.get(nombreGrupo) || [];

      if (nombreCategoria) {
        if (!validarCategoriaEnGrupo(nombreGrupo, nombreCategoria)) {
          return res.status(400).json({
            success: false,
            error: `La categoría '${nombreCategoria}' no pertenece al grupo '${nombreGrupo}'`,
            categoriasDelGrupo
          });
        }
        productosAFiltrar = productosAFiltrar.filter(p => p.nombre_categoria === nombreCategoria);
      }
    } else {
      productosAFiltrar = productCache.all;
    }

    const totalProductos = productosAFiltrar.length;
    const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
    const indiceInicio = (pagina - 1) * productosPorPagina;
    const productosPaginados = productosAFiltrar.slice(indiceInicio, indiceInicio + productosPorPagina);

    res.json({
      success: true,
      data: {
        nombreGrupo: nombreGrupoRespuesta,
        categoriasDelGrupo,
        paginaActual: pagina,
        totalPaginas,
        totalProductos,
        productosPorPagina,
        productos: productosPaginados
      },
      lastUpdated: productCache.lastUpdated
    });
  } catch (error) {
    console.error('❌ Error en GET /productos/grupo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener productos por grupo',
      message: error.message
    });
  }
});

/**
 * GET /api/productos/buscar
 * Busca productos por término de búsqueda
 */
router.get('/buscar', async (req, res) => {
  try {
    const { termino, limite } = req.query;
    
    if (!termino || termino.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un término de búsqueda'
      });
    }

    const limiteBusqueda = parseInt(limite, 10) || 10;
    let productCache = getCache('cache_de_productos');
    if (!productCache) {
      productCache = await fetchAndCacheProductos();
    }

    const todosLosProductos = productCache.all;
    const terminoBusqueda = termino.toUpperCase();
    const resultados = new Set();

    // Primera pasada: coincidencias que empiecen con el término
    for (const p of todosLosProductos) {
      if (resultados.size >= limiteBusqueda) break;
      if (p.nombre.toUpperCase().startsWith(terminoBusqueda)) {
        resultados.add(p);
      }
    }

    // Segunda pasada: coincidencias que contengan el término
    if (resultados.size < limiteBusqueda) {
      for (const p of todosLosProductos) {
        if (resultados.size >= limiteBusqueda) break;
        if (p.nombre.toUpperCase().includes(terminoBusqueda) && !resultados.has(p)) {
          resultados.add(p);
        }
      }
    }

    res.json({
      success: true,
      data: Array.from(resultados),
      total: resultados.size,
      termino,
      lastUpdated: productCache.lastUpdated
    });
  } catch (error) {
    console.error('❌ Error en GET /productos/buscar:', error);
    res.status(500).json({
      success: false,
      error: 'Error al buscar productos',
      message: error.message
    });
  }
});

/**
 * GET /api/productos/:id
 * Obtiene un producto específico con productos relacionados
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    let productCache = getCache('cache_de_productos');
    if (!productCache) {
      productCache = await fetchAndCacheProductos();
    }

    const productoPrincipal = productCache.byId.get(id);
    if (!productoPrincipal) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Buscar productos relacionados
    const productosRelacionados = new Set();
    const nombreProductoPrincipal = productoPrincipal.nombre.toUpperCase();
    const palabrasNombre = nombreProductoPrincipal.split(' ').filter(p => p.length > 0);
    const otrosProductos = productCache.all.filter(p => p.id !== id);

    // Buscar por palabras del nombre (menos la última)
    if (palabrasNombre.length > 1) {
      const terminoBusquedaPrimario = palabrasNombre.slice(0, -1).join(' ');
      for (const p of otrosProductos) {
        if (productosRelacionados.size >= 10) break;
        if (p.nombre.toUpperCase().startsWith(terminoBusquedaPrimario)) {
          productosRelacionados.add(p);
        }
      }
    }

    // Buscar por primera palabra
    if (productosRelacionados.size < 10 && palabrasNombre.length > 0) {
      const terminoBusquedaSecundario = palabrasNombre[0];
      for (const p of otrosProductos) {
        if (productosRelacionados.size >= 10) break;
        if (p.nombre.toUpperCase().startsWith(terminoBusquedaSecundario)) {
          productosRelacionados.add(p);
        }
      }
    }

    // Buscar por misma categoría
    if (productosRelacionados.size < 10 && productoPrincipal.categoria_ref) {
      const productosMismaCategoria = otrosProductos.filter(p => p.categoria_ref === productoPrincipal.categoria_ref);
      const productosAleatoriosCategoria = shuffle(productosMismaCategoria);
      for (const p of productosAleatoriosCategoria) {
        if (productosRelacionados.size >= 10) break;
        productosRelacionados.add(p);
      }
    }

    const respuestaFinal = {
      ...productoPrincipal,
      productos_relacionados: Array.from(productosRelacionados).slice(0, 10)
    };

    res.json({
      success: true,
      data: respuestaFinal,
      lastUpdated: productCache.lastUpdated
    });
  } catch (error) {
    console.error(`❌ Error en GET /productos/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener producto',
      message: error.message
    });
  }
});

module.exports = router;
