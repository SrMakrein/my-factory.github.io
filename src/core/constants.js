/**
 * Constantes y Enums del juego
 * Define todos los tipos, recursos y direcciones utilizadas en el proyecto
 */

// ============================================================================
// TIPOS DE RECURSOS
// ============================================================================

const ResourceType = {
  IRON: "iron",
  COPPER: "copper",
  COAL: "coal",
  IRON_PLATE: "iron_plate",
  COPPER_PLATE: "copper_plate",
  CABLE: "cable",
  COIL: "coil",
  CONSTRUCTION_PARTS: "construction_parts",
};

// ============================================================================
// TIPOS DE EDIFICIOS
// ============================================================================

const BuildingType = {
  MINER: "miner",
  CONVEYOR: "conveyor",
  STORAGE: "storage",
  SMELTER: "smelter",
  ASSEMBLER: "assembler",
  LABORATORY: "laboratory",
  ADVANCED_ASSEMBLER: "advanced_assembler",
  REFINERY: "refinery",
};

// ============================================================================
// DIRECCIONES
// ============================================================================

const Direction = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
};

// ============================================================================
// CONFIGURACIÓN DE JUEGO
// ============================================================================

const GameConfig = {
  // Grid
  GRID_WIDTH: 40,
  GRID_HEIGHT: 40,
  TILE_SIZE: 32,

  // Capacidades
  MAX_MINER_CAPACITY: 25,
  MAX_CONVEYOR_CAPACITY: 8,
  MAX_STORAGE_CAPACITY: 250,
  MAX_SMELTER_FUEL_CAPACITY: 10,
  MAX_SMELTER_MATERIAL_CAPACITY: 10,
  MAX_SMELTER_PRODUCT_CAPACITY: 10,

  // Velocidades
  TICK_RATE: 10, // Ticks por segundo
  SMELTER_RECIPE_TIME: 30, // Ticks
  ASSEMBLER_RECIPE_BASE_TIME: 10, // Base en ticks

  // Experiencia
  EXPERIENCE_PER_LEVEL: 100,
  LABORATORY_TICK_THRESHOLD: 10, // Cada 10 ticks genera 1 EXP

  // Laboratorio
  LABORATORY_CABLE_COST: 10,
  LABORATORY_COPPER_PLATE_COST: 5,
};

// ============================================================================
// DESCRIPCIONES DE EDIFICIOS
// ============================================================================

const BuildingDescriptions = {
  miner: {
    name: "Minero ⛏",
    description: "Extrae recursos del suelo automáticamente",
    details: [
      "Extrae recursos minerales del terreno",
      "Capacidad: 25 items",
      "Velocidad: 1 item por tick",
      "Requiere estar en un nodo de recurso",
      "Coloca sobre hierro, cobre o carbón",
    ]
  },
  conveyor: {
    name: "Cinta Transportadora 🚚",
    description: "Transporta recursos en dirección específica",
    details: [
      "Velocidad: 1 item/tile/tick",
      "Capacidad: 8 items",
      "Direcciones: UP (↑), RIGHT (→), DOWN (↓), LEFT (←)",
      "Presiona R para rotar la dirección",
      "Conecta edificios en líneas de producción",
    ]
  },
  storage: {
    name: "Almacén 📦",
    description: "Almacena recursos sin límite de tipos",
    details: [
      "Capacidad: 250 items mixtos",
      "Recibe de cintas que apunten hacia él",
      "Envía a cintas que apunten hacia afuera",
      "Hub central para gestionar inventario",
      "Las cintas deben apuntar correctamente",
    ]
  },
  smelter: {
    name: "Fundición 🔥",
    description: "Procesa minerales en placas metálicas",
    details: [
      "Receta: Mineral + Carbón → Placa (30 ticks)",
      "Hierro + Carbón → Placa de Hierro",
      "Cobre + Carbón → Placa de Cobre",
      "Requiere investigación 'Fundición Básica'",
      "Conecta con cintas direccionadas correctamente",
    ]
  },
  assembler: {
    name: "Ensamblador ⚙️",
    description: "Combina materiales en productos complejos",
    details: [
      "Recetas disponibles:",
      "  • Cable: 2x Placa de Cobre (10 ticks)",
      "  • Bobina: 10x Cable (15 ticks)",
      "  • Piezas de Construcción: 1x Placa de Hierro (20 ticks)",
      "Requiere investigación 'Ensamblaje Básico'",
      "Selecciona receta en el panel de información",
    ]
  },
  laboratory: {
    name: "Laboratorio 🧪",
    description: "Genera experiencia para subir de nivel",
    details: [
      "Requiere: 10x Cable + 5x Placa de Cobre",
      "Genera 1 punto de experiencia cada 10 ticks",
      "La experiencia sube tu nivel y desbloquea edificios",
      "Se requiere mantener los recursos en almacenes",
      "A mayor nivel, más edificios y recetas disponibles",
    ]
  },
  advanced_assembler: {
    name: "Ensamblador Avanzado ⚙️⚙️",
    description: "Combina materiales avanzados - Desbloquea en nivel 2",
    details: [
      "Recetas:",
      "  • Bobina Avanzada: 20x Cable + 5x Placa de Hierro (25 ticks)",
      "  • Componente Electrónico: 2x Bobina + 1x Cable (30 ticks)",
      "Requiere experiencia de nivel 2",
      "Abre nuevas cadenas de producción",
    ]
  },
  refinery: {
    name: "Refinería 🏭",
    description: "Procesa recursos en derivados - Desbloquea en nivel 3",
    details: [
      "Requiere: 15x Placa de Cobre + 10x Placa de Hierro",
      "Genera combustible mejorado y materiales avanzados",
      "Producción más eficiente que fundiciones",
      "Desbloquea en nivel 3",
    ]
  },
};
