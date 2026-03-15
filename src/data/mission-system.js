/**
 * Sistema de Misiones
 * Define los objetivos disponibles para el jugador
 */

const MissionSystem = {
  missions: [
    {
      id: "mission_1",
      name: "Primer Lingote",
      description: "Produce 10 placas de hierro para empezar la fundición",
      type: "production",
      target: "iron_plate",
      quantity: 10,
      reward: 100,
      completed: false,
      progress: 0,
    },
    {
      id: "mission_2",
      name: "Maestro de Minerales",
      description: "Minería de 50 recursos en total",
      type: "mining",
      target: null,
      quantity: 50,
      reward: 150,
      completed: false,
      progress: 0,
    },
    {
      id: "mission_3",
      name: "Producción en Serie",
      description: "Produce 20 cables con el ensamblador",
      type: "production",
      target: "cable",
      quantity: 20,
      reward: 200,
      completed: false,
      progress: 0,
    },
    {
      id: "mission_4",
      name: "Ingeniero Completo",
      description: "Desbloquea todas las investigaciones básicas",
      type: "research",
      target: null,
      quantity: 3,
      reward: 500,
      completed: false,
      progress: 0,
    },
    {
      id: "mission_5",
      name: "Fábrica Compleja",
      description: "Utiliza 5 tipos diferentes de edificios simultáneamente",
      type: "building_types",
      target: null,
      quantity: 5,
      reward: 300,
      completed: false,
      progress: 0,
    },
  ],
  currentMissionIndex: 0,
  totalResearchPoints: 0,
};
