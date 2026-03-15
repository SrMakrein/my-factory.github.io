/**
 * Sistema de Investigación
 * Define el árbol de tecnologías disponibles en el juego
 */

const ResearchTree = {
  // Tier 1: Industria Básica
  basic_smelting: {
    name: "Fundición Básica",
    description: "Desbloquea el edificio Fundición",
    cost: 50,
    unlocks: ["smelter"],
    prerequisite: null,
    completed: false,
    progress: 0,
  },
  basic_assembly: {
    name: "Ensamblaje Básico",
    description: "Desbloquea el edificio Ensamblador",
    cost: 100,
    unlocks: ["assembler"],
    prerequisite: "basic_smelting",
    completed: false,
    progress: 0,
  },

  // Tier 3: Automatización Avanzada
  fast_transport: {
    name: "Transporte Rápido",
    description: "Aumenta la velocidad de las cintas (2 items/tick → 4)",
    cost: 250,
    unlocks: [],
    prerequisite: "basic_assembly",
    completed: false,
    progress: 0,
  },
};
