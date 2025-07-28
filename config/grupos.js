/**
 * Configuración de grupos de productos para la API
 * Migrado desde Firebase Functions para Fly.io
 */

const mapeoGrupos = {
  "Alimentos Frescos": {
    categorias: ["Carnes", "Frutas", "Verduras", "Lacteos y huevos"],
    color: "#ff0000",
  },
  "Bebidas": {
    categorias: ["Bebidas", "Bebidas gaseosas", "Bebidas alcohólicas", "Café e infusiones", "Bebidas y alimentos instantáneas"],
    color: "#0400f0",
  },
  "Abarrotes": {
    categorias: ["Abarrotes", "Harinas", "Fideos", "Enlatados", "Grasas y Aceites", "Condimentos y esencias"],
    color: "#45923a",
  },
  "Snacks y Dulces": {
    categorias: ["Snacks y cereales", "Chocolates y dulces", "Galletas"],
    color: "#ff7700",
  },
  "Cuidado Personal y Limpieza": {
    categorias: ["Cuidado Personal", "Productos de limpieza"],
    color: "#0095ff",
  },
  "Panadería y Embutidos": {
    categorias: ["Panadería", "Embutidos"],
    color: "#0000ff",
  },
  "Útiles Escolares": {
    categorias: ["Útiles escolares"],
    color: "#f05400",
  },
  "Alimentos para Animales": {
    categorias: ["Alimentos para animales"],
    color: "#45923a",
  },
  "Gas y Licorería": {
    categorias: ["GAS", "Licorería"],
    color: "#45923a",
  }
};

/**
 * Obtiene todos los nombres de grupos disponibles
 */
function getGruposDisponibles() {
  return Object.keys(mapeoGrupos);
}

/**
 * Obtiene la configuración de un grupo específico
 * @param {string} nombreGrupo - Nombre del grupo
 * @returns {object|null} - Configuración del grupo o null si no existe
 */
function getConfiguracionGrupo(nombreGrupo) {
  return mapeoGrupos[nombreGrupo] || null;
}

/**
 * Obtiene el nombre del grupo para una categoría específica
 * @param {string} nombreCategoria - Nombre de la categoría
 * @returns {string|null} - Nombre del grupo o null si no se encuentra
 */
function getGrupoPorCategoria(nombreCategoria) {
  for (const [nombreGrupo, config] of Object.entries(mapeoGrupos)) {
    if (config.categorias.includes(nombreCategoria)) {
      return nombreGrupo;
    }
  }
  return null;
}

/**
 * Valida si una categoría pertenece a un grupo específico
 * @param {string} nombreGrupo - Nombre del grupo
 * @param {string} nombreCategoria - Nombre de la categoría
 * @returns {boolean} - True si la categoría pertenece al grupo
 */
function validarCategoriaEnGrupo(nombreGrupo, nombreCategoria) {
  const grupo = mapeoGrupos[nombreGrupo];
  return grupo ? grupo.categorias.includes(nombreCategoria) : false;
}

module.exports = {
  mapeoGrupos,
  getGruposDisponibles,
  getConfiguracionGrupo,
  getGrupoPorCategoria,
  validarCategoriaEnGrupo
};
