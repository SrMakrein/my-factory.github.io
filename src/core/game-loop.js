// ============================================================================
// GAME LOOP - Lógica del juego y bucle principal
// ============================================================================

class GameLoop {
  constructor(canvasId) {
    this.spriteCache = new SpriteCache();
    this.gridSystem = new GridSystem(40, 40);
    this.camera = new Camera(0, 0, window.innerWidth, window.innerHeight);

    this.renderer = new Renderer(canvasId, this.spriteCache);

    this.gameState = {
      buildings: new Map(),
      resources: new Map(),
      playerInventory: {
        iron: 0,
        copper: 0,
        coal: 0,
        iron_plate: 0,
        copper_plate: 0,
      },
      playerLevel: 1,
      playerExperience: 0,
      experiencePerLevel: 100,
      grid: this.gridSystem.getGrid(),
      camera: this.camera.position,
      gameTime: 0,
      isPaused: false,
      research: JSON.parse(JSON.stringify(ResearchTree)),
      missions: JSON.parse(JSON.stringify(MissionSystem.missions)),
      researchPoints: 0,
      unlockedBuildings: new Set([BuildingType.MINER, BuildingType.CONVEYOR, BuildingType.STORAGE, BuildingType.SMELTER, BuildingType.ASSEMBLER, BuildingType.LABORATORY]),
    };

    this.running = false;
    this.animationFrameId = null;
    this.lastFrameTime = 0;
    this.deltaTime = 0;
    this.tickCounter = 0;
    this.tickRate = 10;
    this.placementMode = null;
    
    // Sistema de botones clickeables
    this.activeButtons = [];
    
    // Registrar instancia global
    window.gameLoopInstance = this;

    this.setupInputHandlers();
    this.loadGame();
  }

  setupInputHandlers() {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      this.lastMouseX = e.clientX - rect.left;
      this.lastMouseY = e.clientY - rect.top;
    });

    canvas.addEventListener("click", (e) => this.handleCanvasClick(e));
    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.placementMode = null;
    });

    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.8 : 1.2;
      const rect = canvas.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      this.camera.zoomAt(factor, cursorX, cursorY);
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 1) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const worldPos = this.camera.screenToWorld(screenX, screenY);
        const gridX = Math.floor(worldPos.x / 32);
        const gridY = Math.floor(worldPos.y / 32);
        
        const building = this.gridSystem.getBuildingAt(gridX, gridY);
        if (building) {
          let itemsDeleted = 0;
          
          if (building.inventory && building.inventory.length > 0) {
            for (const resource of building.inventory) {
              this.gameState.resources.delete(resource.id);
              itemsDeleted++;
            }
          }
          
          if (building.type === BuildingType.SMELTER) {
            if (building.fuelInventory && building.fuelInventory.length > 0) {
              for (const resource of building.fuelInventory) {
                this.gameState.resources.delete(resource.id);
                itemsDeleted++;
              }
            }
            if (building.materialInventory && building.materialInventory.length > 0) {
              for (const resource of building.materialInventory) {
                this.gameState.resources.delete(resource.id);
                itemsDeleted++;
              }
            }
          }
          
          this.gridSystem.removeBuilding(gridX, gridY);
          this.gameState.buildings.delete(building.id);
          this.gameState.selectedBuilding = undefined;
          
          logger.info(`🗑️ ${building.type} eliminado en (${gridX}, ${gridY}) - ${itemsDeleted} items purgados`);
        }
      }
    });

    document.addEventListener("keydown", (e) => this.handleKeyDown(e));

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 2) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });

    canvas.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const dx = (e.clientX - lastX) / this.camera.zoom;
        const dy = (e.clientY - lastY) / this.camera.zoom;
        this.camera.panBy(-dx, -dy);
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });

    canvas.addEventListener("mouseup", () => {
      isDragging = false;
    });

    window.addEventListener("resize", () => {
      this.camera.setSize(window.innerWidth, window.innerHeight);
    });
  }

  handleCanvasClick(event) {
    const canvas = event.target;
    const rect = canvas.getBoundingClientRect();
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;

    for (const button of this.activeButtons) {
      if (screenX >= button.x && screenX <= button.x + button.width &&
          screenY >= button.y && screenY <= button.y + button.height) {
        button.onClick();
        return;
      }
    }

    const worldPos = this.camera.screenToWorld(screenX, screenY);
    const gridX = Math.floor(worldPos.x / 32);
    const gridY = Math.floor(worldPos.y / 32);

    const panelWidth = Math.floor(this.renderer.canvas.width * 0.35);
    const panelHeight = Math.floor(this.renderer.canvas.height * 0.85);
    const panelX = this.renderer.canvas.width - panelWidth;
    const panelY = 10;

    if (this.placementMode) {
      if (!this.gridSystem.canPlaceBuilding(gridX, gridY)) {
        console.log("❌ No se puede colocar aquí (ocupado)");
        this.placementMode = null;
        return;
      }
      
      const success = this.placeBuilding(this.placementMode, gridX, gridY);
      if (!success) {
        console.log("❌ Error al colocar edificio");
      }
      this.placementMode = null;
      return;
    }

    if (this.gameState.selectedBuilding) {
      if (screenX >= panelX && screenX <= this.renderer.canvas.width && 
          screenY >= panelY && screenY <= panelY + panelHeight) {
        return;
      }
    }

    const building = this.gridSystem.getBuildingAt(gridX, gridY);
    if (building) {
      this.gameState.selectedBuilding = building;
    } else {
      this.gameState.selectedBuilding = undefined;
    }
  }

  handleKeyDown(event) {
    const key = event.key.toUpperCase();

    if (key === "M") {
      this.placementMode = BuildingType.MINER;
    } else if (key === "C") {
      this.placementMode = BuildingType.CONVEYOR;
    } else if (key === "A") {
      this.placementMode = BuildingType.STORAGE;
    } else if (key === "F") {
      if (this.gameState.unlockedBuildings.has(BuildingType.SMELTER)) {
        this.placementMode = BuildingType.SMELTER;
      } else {
        logger.warn("🔒 Fundición bloqueada - investiga 'Fundición Básica'");
      }
    } else if (key === "E") {
      if (this.gameState.unlockedBuildings.has(BuildingType.ASSEMBLER)) {
        this.placementMode = BuildingType.ASSEMBLER;
      } else {
        logger.warn("🔒 Ensamblador bloqueado - investiga 'Ensamblaje Básico'");
      }
    } else if (key === "L") {
      if (this.gameState.unlockedBuildings.has(BuildingType.LABORATORY)) {
        this.placementMode = BuildingType.LABORATORY;
      } else {
        logger.warn("🔒 Laboratorio bloqueado - disponible desde el inicio");
      }
    } else if (key === "U") {
      if (this.gameState.playerLevel >= 2 && this.gameState.unlockedBuildings.has(BuildingType.ADVANCED_ASSEMBLER)) {
        this.placementMode = BuildingType.ADVANCED_ASSEMBLER;
      } else {
        logger.warn("🔒 Ensamblador Avanzado bloqueado - requiere nivel 2");
      }
    } else if (key === "P") {
      if (this.gameState.playerLevel >= 3 && this.gameState.unlockedBuildings.has(BuildingType.REFINERY)) {
        this.placementMode = BuildingType.REFINERY;
      } else {
        logger.warn("🔒 Refinería bloqueada - requiere nivel 3");
      }
    } else if (key === " ") {
      this.gameState.isPaused = !this.gameState.isPaused;
    } else if (key === "S") {
      this.saveGame();
      console.log("Partida guardada");
    } else if (key === "R") {
      if (this.gameState.selectedBuilding && this.gameState.selectedBuilding.type === BuildingType.CONVEYOR) {
        this.gameState.selectedBuilding.direction = (this.gameState.selectedBuilding.direction + 1) % 4;
        console.log("Cinta rotada");
      }
    } else if (key === "T") {
      logger.info("📊 Panel de investigación - próximamente");
    }
  }

  placeBuilding(type, gridX, gridY) {
    if (!this.gridSystem.canPlaceBuilding(gridX, gridY)) {
      return false;
    }

    const building = {
      id: `${type}_${Date.now()}`,
      type,
      position: { x: gridX, y: gridY },
      direction: Direction.RIGHT,
      inputs: [],
      outputs: [],
      inventory: [],
      outputInventory: [],
      recipeProgress: 0,
      isActive: true,
      health: 100,
      maxHealth: 100,
    };

    if (type === BuildingType.SMELTER) {
      building.fuelInventory = [];
      building.materialInventory = [];
    }

    if (type === BuildingType.ASSEMBLER) {
      building.selectedRecipe = null;
      building.inputInventory = [];
      building.outputInventory = [];
      building.recipeProgress = 0;
      building.isActive = false;
      building.inventory = [];
    }

    if (type === BuildingType.LABORATORY) {
      building.experienceTickCounter = 0;
      building.inputInventory = [];
      building.lastExperienceTime = 0;
      building.maxInventory = 25; // Capacidad total flexible para recibir recursos
    }

    if (type === BuildingType.ADVANCED_ASSEMBLER) {
      building.selectedRecipe = null;
      building.inputInventory = [];
      building.outputInventory = [];
      building.recipeProgress = 0;
      building.isActive = false;
      building.inventory = [];
    }

    if (type === BuildingType.REFINERY) {
      building.selectedRecipe = null;
      building.inputInventory = [];
      building.outputInventory = [];
      building.recipeProgress = 0;
      building.isActive = false;
      building.inventory = [];
    }

    this.gridSystem.placeBuilding(gridX, gridY, building);
    this.gameState.buildings.set(building.id, building);
    this.gameState.selectedBuilding = building;
    console.log(`✅ ${type} colocado en (${gridX}, ${gridY})`);
    return true;
  }

  update(deltaTime) {
    if (this.gameState.isPaused) return;

    this.deltaTime = deltaTime;
    this.tickCounter += deltaTime;

    this.gameState.gameTime += deltaTime;

    const tickDuration = 1000 / this.tickRate;
    while (this.tickCounter >= tickDuration) {
      this.updateTick();
      this.tickCounter -= tickDuration;
    }
  }

  updateTick() {
    logger.tick();
    
    try {
      this.updateMissions();

      for (const building of this.gameState.buildings.values()) {
        this.updateBuilding(building);
      }

      for (const building of this.gameState.buildings.values()) {
        if (building.type === BuildingType.SMELTER) {
          this.collectSmelterInputs(building);
        }
      }

      for (const building of this.gameState.buildings.values()) {
        if (building.type === BuildingType.ASSEMBLER) {
          this.collectAssemblerInputs(building);
        }
      }

      let totalResources = 0;
      let resourcesByType = {};
      for (const resource of this.gameState.resources.values()) {
        totalResources++;
        resourcesByType[resource.type] = (resourcesByType[resource.type] || 0) + 1;
      }
      logger.debug(`📊 Recursos en mundo: total=${totalResources}, tipos=${JSON.stringify(resourcesByType)}`);

      for (const building of this.gameState.buildings.values()) {
        if (building.type === BuildingType.CONVEYOR) {
          this.processConveyorBelt(building);
        }
      }

      for (const building of this.gameState.buildings.values()) {
        if (building.type === BuildingType.ASSEMBLER) {
          this.processAssembler(building);
        }
      }

      for (const building of this.gameState.buildings.values()) {
        if (building.type === BuildingType.SMELTER) {
          this.transferSmelterProducts(building);
        }
      }

      for (const building of this.gameState.buildings.values()) {
        if (building.type === BuildingType.ASSEMBLER) {
          this.transferAssemblerProducts(building);
        }
      }

      for (const building of this.gameState.buildings.values()) {
        if (building.type === BuildingType.LABORATORY) {
          this.processLaboratory(building);
        }
      }

      for (const building of this.gameState.buildings.values()) {
        if (building.type === BuildingType.STORAGE) {
          this.transferStorageProducts(building);
        }
      }

      this.cleanOrphanedResources();
    } catch (e) {
      logger.error(`❌ Error en updateTick: ${e.message}`);
      console.error(e);
    }
  }

  updateMissions() {
    for (const mission of this.gameState.missions) {
      if (mission.completed) continue;

      switch (mission.type) {
        case "production": {
          let count = 0;
          for (const building of this.gameState.buildings.values()) {
            if (building.type === BuildingType.STORAGE) {
              count += building.inventory.filter(r => r.type === mission.target).length;
            }
          }
          mission.progress = Math.min(count, mission.quantity);
          if (count >= mission.quantity) {
            mission.completed = true;
            this.gameState.researchPoints += mission.reward;
            logger.info(`✅ Misión completada: "${mission.name}" - +${mission.reward} puntos`);
          }
          break;
        }

        case "mining": {
          let count = 0;
          for (const building of this.gameState.buildings.values()) {
            if (building.type === BuildingType.STORAGE) {
              count += building.inventory.length;
            }
          }
          mission.progress = Math.min(count, mission.quantity);
          if (count >= mission.quantity) {
            mission.completed = true;
            this.gameState.researchPoints += mission.reward;
            logger.info(`✅ Misión completada: "${mission.name}" - +${mission.reward} puntos`);
          }
          break;
        }

        case "research": {
          let count = 0;
          for (const [key, research] of Object.entries(this.gameState.research)) {
            if (research.completed && !research.prerequisite) {
              count++;
            }
          }
          mission.progress = Math.min(count, mission.quantity);
          if (count >= mission.quantity) {
            mission.completed = true;
            this.gameState.researchPoints += mission.reward;
            logger.info(`✅ Misión completada: "${mission.name}" - +${mission.reward} puntos`);
          }
          break;
        }

        case "building_types": {
          const buildingTypes = new Set();
          for (const building of this.gameState.buildings.values()) {
            buildingTypes.add(building.type);
          }
          mission.progress = Math.min(buildingTypes.size, mission.quantity);
          if (buildingTypes.size >= mission.quantity) {
            mission.completed = true;
            this.gameState.researchPoints += mission.reward;
            logger.info(`✅ Misión completada: "${mission.name}" - +${mission.reward} puntos`);
          }
          break;
        }
      }
    }
  }

  cleanOrphanedResources() {
    const resourcesInInventories = new Set();

    for (const building of this.gameState.buildings.values()) {
      if (building.inventory && Array.isArray(building.inventory)) {
        for (const resource of building.inventory) {
          resourcesInInventories.add(resource.id);
        }
      }
      if (building.fuelInventory && Array.isArray(building.fuelInventory)) {
        for (const resource of building.fuelInventory) {
          resourcesInInventories.add(resource.id);
        }
      }
      if (building.materialInventory && Array.isArray(building.materialInventory)) {
        for (const resource of building.materialInventory) {
          resourcesInInventories.add(resource.id);
        }
      }
      if (building.outputInventory && Array.isArray(building.outputInventory)) {
        for (const resource of building.outputInventory) {
          resourcesInInventories.add(resource.id);
        }
      }
      if (building.inputInventory && Array.isArray(building.inputInventory)) {
        for (const resource of building.inputInventory) {
          resourcesInInventories.add(resource.id);
        }
      }
    }

    if (this.gameState.playerInventory && Array.isArray(this.gameState.playerInventory)) {
      for (const resource of this.gameState.playerInventory) {
        resourcesInInventories.add(resource.id);
      }
    }

    let orphanCount = 0;
    for (const resource of this.gameState.resources.values()) {
      if (!resourcesInInventories.has(resource.id)) {
        this.gameState.resources.delete(resource.id);
        orphanCount++;
      }
    }

    if (orphanCount > 0) {
      logger.warn(`⚠️ Limpiados ${orphanCount} recursos huérfanos flotantes`);
    }
  }

  getAvailableResourcesInStorages() {
    const available = {
      iron: 0,
      copper: 0,
      coal: 0,
      iron_plate: 0,
      copper_plate: 0,
      cable: 0,
      coil: 0,
      construction_parts: 0,
    };

    for (const building of this.gameState.buildings.values()) {
      if (building.type === BuildingType.STORAGE && building.inventory && Array.isArray(building.inventory)) {
        for (const resource of building.inventory) {
          if (available.hasOwnProperty(resource.type)) {
            available[resource.type]++;
          }
        }
      }
    }

    return available;
  }

  processLaboratory(laboratory) {
    const required = {
      cable: 10,
      copper_plate: 5,
    };

    // Contar recursos en el laboratorio
    let cableCount = 0;
    let copperCount = 0;

    if (laboratory.inventory) {
      for (const resource of laboratory.inventory) {
        if (resource.type === ResourceType.CABLE) cableCount++;
        if (resource.type === ResourceType.COPPER_PLATE) copperCount++;
      }
    }

    // Verificar si hay suficientes recursos en el laboratorio
    const canProcess = cableCount >= required.cable && copperCount >= required.copper_plate;

    if (canProcess) {
      laboratory.experienceTickCounter = (laboratory.experienceTickCounter || 0) + 1;

      if (laboratory.experienceTickCounter >= 10) {
        laboratory.experienceTickCounter = 0;
        
        // Consumir recursos del laboratorio
        let cableRemoved = 0;
        let copperRemoved = 0;

        for (let i = (laboratory.inventory || []).length - 1; i >= 0; i--) {
          const resource = laboratory.inventory[i];
          
          if (cableRemoved < required.cable && resource.type === ResourceType.CABLE) {
            laboratory.inventory.splice(i, 1);
            this.gameState.resources.delete(resource.id);
            cableRemoved++;
          } else if (copperRemoved < required.copper_plate && resource.type === ResourceType.COPPER_PLATE) {
            laboratory.inventory.splice(i, 1);
            this.gameState.resources.delete(resource.id);
            copperRemoved++;
          }
        }

        this.addExperience(1);
        logger.info(`🧪 Laboratorio: +1 EXP (Total: ${this.gameState.playerExperience}/${this.getCurrentLevelRequirement()})`);
      }
    } else {
      laboratory.experienceTickCounter = 0;
      logger.debug(`🔒 Lab requiere: ${required.cable}x Cable (tiene ${cableCount}), ${required.copper_plate}x Placa de Cobre (tiene ${copperCount})`);
    }
  }

  addExperience(amount) {
    this.gameState.playerExperience += amount;
    
    const currentRequirement = this.getCurrentLevelRequirement();
    if (this.gameState.playerExperience >= currentRequirement) {
      this.levelUp();
    }
  }

  levelUp() {
    this.gameState.playerLevel++;
    this.gameState.playerExperience = 0;
    
    if (this.gameState.playerLevel >= 1) {
      this.gameState.unlockedBuildings.add(BuildingType.LABORATORY);
    }
    if (this.gameState.playerLevel >= 2) {
      this.gameState.unlockedBuildings.add(BuildingType.ADVANCED_ASSEMBLER);
      logger.info(`⭐ ¡NIVEL 2! Ensamblador Avanzado desbloqueado (Presiona U)`);
    }
    if (this.gameState.playerLevel >= 3) {
      this.gameState.unlockedBuildings.add(BuildingType.REFINERY);
      logger.info(`⭐ ¡NIVEL 3! Refinería desbloqueada (Presiona P)`);
    }
    
    logger.info(`🎉 ¡NIVEL UP! Ahora eres nivel ${this.gameState.playerLevel}`);
  }

  getCurrentLevelRequirement() {
    return this.gameState.experiencePerLevel * this.gameState.playerLevel;
  }

  collectSmelterInputs(smelter) {
    try {
      const maxFuelCapacity = 10;
      const maxMaterialCapacity = 10;
      const maxProductCapacity = 10;

      let fuelCount = smelter.fuelInventory?.length || 0;
      let materialCount = smelter.materialInventory?.length || 0;
      let productCount = smelter.inventory?.length || 0;

      if (fuelCount >= maxFuelCapacity && materialCount >= maxMaterialCapacity && productCount >= maxProductCapacity) {
        return;
      }

      const adjacentChecks = [
        { pos: { x: smelter.position.x, y: smelter.position.y - 1 }, requiredDir: Direction.DOWN },
        { pos: { x: smelter.position.x + 1, y: smelter.position.y }, requiredDir: Direction.LEFT },
        { pos: { x: smelter.position.x, y: smelter.position.y + 1 }, requiredDir: Direction.UP },
        { pos: { x: smelter.position.x - 1, y: smelter.position.y }, requiredDir: Direction.RIGHT },
      ];

      let itemsCollected = 0;
      const maxIterations = 4;
      let iterations = 0;
      
      for (const check of adjacentChecks) {
        if (iterations++ > maxIterations) {
          logger.warn(`⚠️ Límite de iteraciones alcanzado en smelter (${smelter.position.x},${smelter.position.y})`);
          break;
        }
        
        const adjacentBuilding = this.gridSystem.getBuildingAt(check.pos.x, check.pos.y);
        if (adjacentBuilding && adjacentBuilding.type === BuildingType.CONVEYOR && 
            adjacentBuilding.direction === check.requiredDir &&
            adjacentBuilding.inventory.length > 0) {
          const resource = adjacentBuilding.inventory[0];
          let canAdd = false;

          if (resource.type === ResourceType.COAL) {
            if (fuelCount + itemsCollected < maxFuelCapacity) {
              canAdd = true;
              adjacentBuilding.inventory.shift();
              smelter.fuelInventory.push(resource);
              fuelCount++;
              itemsCollected++;
            }
          } else if (resource.type === ResourceType.IRON || resource.type === ResourceType.COPPER) {
            if (materialCount + itemsCollected < maxMaterialCapacity) {
              canAdd = true;
              adjacentBuilding.inventory.shift();
              smelter.materialInventory.push(resource);
              materialCount++;
              itemsCollected++;
            }
          }

          if (canAdd) {
            resource.position = { x: smelter.position.x, y: smelter.position.y };
          }
        }
      }

      if (itemsCollected > 0) {
        logger.debug(`✅ Smelter (${smelter.position.x},${smelter.position.y}) recopiló ${itemsCollected} items`);
      }
    } catch (e) {
      logger.error(`❌ Error en collectSmelterInputs: ${e.message}`);
      console.error(e);
    }
  }

  updateBuilding(building) {
    if (building.type === BuildingType.ASSEMBLER && !building.inputInventory) {
      building.inputInventory = building.inventory || [];
      building.inventory = [];
    }

    switch (building.type) {
      case BuildingType.MINER:
        this.updateMiner(building);
        break;
      case BuildingType.SMELTER:
        this.updateSmelter(building);
        break;
    }
  }

  updateMiner(building) {
    if (!building.isActive) return;

    const maxMinerCapacity = 25;
    if (building.inventory.length >= maxMinerCapacity) {
      return;
    }

    const tile = this.gridSystem.getTile(building.position.x, building.position.y);
    if (!tile || !tile.resource) return;

    const extracted = this.gridSystem.extractResource(building.position.x, building.position.y, 2);

    if (extracted > 0) {
      for (let i = 0; i < extracted; i++) {
        if (building.inventory.length >= maxMinerCapacity) break;
        
        const resource = {
          id: `res_${Date.now()}_${i}_${Math.random()}`,
          type: tile.resource.type,
          position: { x: building.position.x, y: building.position.y },
          progress: 0,
          onConveyor: false,
        };
        this.gameState.resources.set(resource.id, resource);
        building.inventory.push(resource);
      }
    }
  }

  updateSmelter(building) {
    const hasMaterial = building.materialInventory && building.materialInventory.length > 0;
    const hasFuel = building.fuelInventory && building.fuelInventory.length > 0;

    if (hasMaterial && hasFuel) {
      building.isActive = true;
    } else {
      building.isActive = false;
      return;
    }

    building.recipeProgress += 1 / 30;

    if (building.recipeProgress >= 1) {
      const fuel = building.fuelInventory.shift();
      this.gameState.resources.delete(fuel.id);

      const material = building.materialInventory.shift();
      this.gameState.resources.delete(material.id);

      const resource = {
        id: `res_${Date.now()}_${Math.random()}`,
        type: material.type === ResourceType.IRON ? ResourceType.IRON_PLATE : ResourceType.COPPER_PLATE,
        position: { x: building.position.x, y: building.position.y },
        progress: 0,
        onConveyor: false,
      };
      this.gameState.resources.set(resource.id, resource);
      building.inventory.push(resource);

      building.recipeProgress = 0;
    }
  }

  transferSmelterProducts(smelter) {
    const maxConveyorInventory = 8;
    const maxStorageInventory = 250;
    
    if (smelter.inventory.length === 0) return;

    const adjacentCheckList = [
      { pos: { x: smelter.position.x, y: smelter.position.y - 1 }, requiredDir: Direction.UP },
      { pos: { x: smelter.position.x + 1, y: smelter.position.y }, requiredDir: Direction.RIGHT },
      { pos: { x: smelter.position.x, y: smelter.position.y + 1 }, requiredDir: Direction.DOWN },
      { pos: { x: smelter.position.x - 1, y: smelter.position.y }, requiredDir: Direction.LEFT }
    ];

    let transferred = 0;
    const maxTransfers = 2;

    for (const check of adjacentCheckList) {
      if (smelter.inventory.length === 0 || transferred >= maxTransfers) break;

      const adjacentBuilding = this.gridSystem.getBuildingAt(check.pos.x, check.pos.y);
      
      if (adjacentBuilding && adjacentBuilding.type === BuildingType.CONVEYOR) {
        if (adjacentBuilding.direction === check.requiredDir) {
          if (adjacentBuilding.inventory.length < maxConveyorInventory) {
            const product = smelter.inventory.shift();
            adjacentBuilding.inventory.push(product);
            product.position = { x: adjacentBuilding.position.x, y: adjacentBuilding.position.y };
            transferred++;
          }
        }
      } else if (adjacentBuilding && adjacentBuilding.type === BuildingType.STORAGE) {
        if (adjacentBuilding.inventory.length < maxStorageInventory) {
          const product = smelter.inventory.shift();
          adjacentBuilding.inventory.push(product);
          product.position = { x: adjacentBuilding.position.x, y: adjacentBuilding.position.y };
          transferred++;
        }
      }
    }

    if (transferred > 0) {
      logger.debug(`✅ Fundición en (${smelter.position.x},${smelter.position.y}) transfirió ${transferred} productos`);
    }
  }

  processConveyorBelt(conveyor) {
    const direction = conveyor.direction !== undefined ? conveyor.direction : Direction.RIGHT;
    const maxConveyorInventory = 8;
    const maxStorageInventory = 250;
    
    let transferCount = 0;
    let maxTransfersPerFrame = 4;

    if (conveyor.inventory.length < maxConveyorInventory) {
      const adjacentPositions = [
        { x: conveyor.position.x, y: conveyor.position.y - 1 },
        { x: conveyor.position.x + 1, y: conveyor.position.y },
        { x: conveyor.position.x, y: conveyor.position.y + 1 },
        { x: conveyor.position.x - 1, y: conveyor.position.y },
      ];

      for (const pos of adjacentPositions) {
        if (conveyor.inventory.length >= maxConveyorInventory) break;
        
        const adjacentBuilding = this.gridSystem.getBuildingAt(pos.x, pos.y);
        if (adjacentBuilding && adjacentBuilding.type === BuildingType.MINER && adjacentBuilding.inventory.length > 0) {
          const resource = adjacentBuilding.inventory.shift();
          conveyor.inventory.push(resource);
        }
      }
    }

    let transferred = 0;
    while (conveyor.inventory.length > 0 && transferred < 1 && transferCount < maxTransfersPerFrame) {
      transferCount++;
      let nextPos = { ...conveyor.position };
      switch (direction) {
        case Direction.UP:
          nextPos.y--;
          break;
        case Direction.DOWN:
          nextPos.y++;
          break;
        case Direction.LEFT:
          nextPos.x--;
          break;
        case Direction.RIGHT:
          nextPos.x++;
          break;
      }

      const nextBuilding = this.gridSystem.getBuildingAt(nextPos.x, nextPos.y);

      if (nextBuilding && nextBuilding.type !== BuildingType.CONVEYOR) {
        let canAdd = true;
        
        if (nextBuilding.type === BuildingType.SMELTER) {
          const maxFuelCapacity = 10;
          const maxMaterialCapacity = 10;
          const resource = conveyor.inventory[0];
          
          if (resource.type === ResourceType.COAL) {
            if (nextBuilding.fuelInventory.length >= maxFuelCapacity) {
              canAdd = false;
            }
          } else if (resource.type === ResourceType.IRON || resource.type === ResourceType.COPPER) {
            if (nextBuilding.materialInventory.length >= maxMaterialCapacity) {
              canAdd = false;
            }
          }
        } else if (nextBuilding.type === BuildingType.STORAGE) {
          if (nextBuilding.inventory.length >= maxStorageInventory) {
            canAdd = false;
          }
        } else if (nextBuilding.type === BuildingType.LABORATORY) {
          // Laboratorio divide la capacidad equitativamente entre Cable y Copper_Plate
          const resource = conveyor.inventory[0];
          const maxLabCapacity = nextBuilding.maxInventory || 25;
          const capacityPerType = Math.floor(maxLabCapacity / 2); // Mitad para cada tipo
          
          if (!((resource.type === ResourceType.CABLE || resource.type === ResourceType.COPPER_PLATE))) {
            canAdd = false;
          } else {
            // Contar cuántos de cada tipo hay
            const cableCount = nextBuilding.inventory.filter(r => r.type === ResourceType.CABLE).length;
            const copperCount = nextBuilding.inventory.filter(r => r.type === ResourceType.COPPER_PLATE).length;
            
            // Solo añadir si no se alcanzó el límite para ese tipo específico
            if (resource.type === ResourceType.CABLE && cableCount >= capacityPerType) {
              canAdd = false;
            } else if (resource.type === ResourceType.COPPER_PLATE && copperCount >= capacityPerType) {
              canAdd = false;
            }
          }
        } else if (nextBuilding.type === BuildingType.ASSEMBLER) {
          // El ensamblador recibe items en inputInventory, no en inventory
          // Se maneja mediante collectAssemblerInputs(), aquí solo ignoramos
          canAdd = false;
        }

        if (canAdd) {
          const resource = conveyor.inventory.shift();
          
          if (nextBuilding.type === BuildingType.SMELTER) {
            if (resource.type === ResourceType.COAL) {
              nextBuilding.fuelInventory.push(resource);
            } else if (resource.type === ResourceType.IRON || resource.type === ResourceType.COPPER) {
              nextBuilding.materialInventory.push(resource);
            } else {
              nextBuilding.inventory.push(resource);
            }
          } else {
            nextBuilding.inventory.push(resource);
          }
          
          resource.position = { x: nextBuilding.position.x, y: nextBuilding.position.y };
          transferred++;
        } else {
          break;
        }
      } else if (nextBuilding && nextBuilding.type === BuildingType.CONVEYOR) {
        if (nextBuilding.inventory.length < maxConveyorInventory) {
          const resource = conveyor.inventory.shift();
          nextBuilding.inventory.push(resource);
          resource.position = { x: nextPos.x, y: nextPos.y };
          transferred++;
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  collectAssemblerInputs(assembler) {
    if (!assembler.inputInventory) {
      assembler.inputInventory = [];
    }
    
    // Determinar capacidad necesaria basada en la receta
    const recipes = {
      cable: { input: ResourceType.COPPER_PLATE, inputCount: 2, output: ResourceType.CABLE, time: 10 },
      coil: { input: ResourceType.CABLE, inputCount: 10, output: ResourceType.COIL, time: 15 },
      construction_parts: { input: ResourceType.IRON_PLATE, inputCount: 1, output: ResourceType.CONSTRUCTION_PARTS, time: 20 }
    };
    
    const recipe = recipes[assembler.selectedRecipe];
    const maxInputCapacity = recipe ? recipe.inputCount : 1;
    
    // No aceptar más items si ya tiene lo que necesita para la receta
    const currentInputCount = recipe ? assembler.inputInventory.filter(r => r.type === recipe.input).length : assembler.inputInventory.length;
    if (currentInputCount >= maxInputCapacity) return;
    
    // No aceptar más items si hay output ya producido
    if (assembler.outputInventory && assembler.outputInventory.length > 0) return;

    const adjacentChecks = [
      { pos: { x: assembler.position.x, y: assembler.position.y - 1 }, requiredDir: Direction.DOWN },
      { pos: { x: assembler.position.x + 1, y: assembler.position.y }, requiredDir: Direction.LEFT },
      { pos: { x: assembler.position.x, y: assembler.position.y + 1 }, requiredDir: Direction.UP },
      { pos: { x: assembler.position.x - 1, y: assembler.position.y }, requiredDir: Direction.RIGHT },
    ];

    logger.debug(`📍 Recolectando inputs para ensamblador en (${assembler.position.x},${assembler.position.y})`);

    for (const check of adjacentChecks) {
      // Actualizar el conteo en cada iteración
      const currentCount = recipe ? assembler.inputInventory.filter(r => r.type === recipe.input).length : assembler.inputInventory.length;
      if (currentCount >= maxInputCapacity) break;

      const adjacentBuilding = this.gridSystem.getBuildingAt(check.pos.x, check.pos.y);
      
      if (adjacentBuilding && adjacentBuilding.type === BuildingType.CONVEYOR && 
          adjacentBuilding.direction === check.requiredDir && 
          adjacentBuilding.inventory.length > 0) {
        const resource = adjacentBuilding.inventory.shift();
        assembler.inputInventory.push(resource);
        resource.position = { x: assembler.position.x, y: assembler.position.y };
        logger.debug(`✅ Ensamblador en (${assembler.position.x},${assembler.position.y}) recolectó ${resource.type}, total entrada: ${assembler.inputInventory.length}`);
      }
    }
  }

  processAssembler(assembler) {
    if (!assembler.selectedRecipe) {
      assembler.isActive = false;
      logger.debug(`⚠️ Ensamblador en (${assembler.position.x},${assembler.position.y}): Sin receta seleccionada`);
      return;
    }

    if (!assembler.inputInventory) {
      assembler.inputInventory = [];
    }
    if (!assembler.outputInventory) {
      assembler.outputInventory = [];
    }

    const recipes = {
      cable: { input: ResourceType.COPPER_PLATE, inputCount: 2, output: ResourceType.CABLE, time: 10 },
      coil: { input: ResourceType.CABLE, inputCount: 10, output: ResourceType.COIL, time: 15 },
      construction_parts: { input: ResourceType.IRON_PLATE, inputCount: 1, output: ResourceType.CONSTRUCTION_PARTS, time: 20 }
    };

    const recipe = recipes[assembler.selectedRecipe];
    if (!recipe) {
      logger.debug(`⚠️ Ensamblador en (${assembler.position.x},${assembler.position.y}): Receta desconocida: ${assembler.selectedRecipe}`);
      return;
    }

    const inputCount = assembler.inputInventory.filter(r => r.type === recipe.input).length;
    logger.debug(`📋 Ensamblador en (${assembler.position.x},${assembler.position.y}): receta=${assembler.selectedRecipe}, necesita=${recipe.inputCount}, tiene=${inputCount}, progress=${assembler.recipeProgress?.toFixed(2) || 0}`);
    
    if (inputCount < recipe.inputCount) {
      assembler.isActive = false;
      return;
    }

    assembler.isActive = true;
    assembler.recipeProgress += 1 / recipe.time;
    logger.debug(`✅ Ensamblador en (${assembler.position.x},${assembler.position.y}) activo, progreso: ${(assembler.recipeProgress * 100).toFixed(1)}%`);

    if (assembler.recipeProgress >= 1) {
      for (let i = 0; i < recipe.inputCount; i++) {
        const inputIndex = assembler.inputInventory.findIndex(r => r.type === recipe.input);
        if (inputIndex !== -1) {
          const input = assembler.inputInventory.splice(inputIndex, 1)[0];
          this.gameState.resources.delete(input.id);
        }
      }

      const output = {
        id: `res_${Date.now()}_${Math.random()}`,
        type: recipe.output,
        position: { x: assembler.position.x, y: assembler.position.y },
        progress: 0,
        onConveyor: false,
      };
      this.gameState.resources.set(output.id, output);
      assembler.outputInventory.push(output);
      logger.debug(`✅ Ensamblador en (${assembler.position.x},${assembler.position.y}) produjo ${recipe.output}`);

      assembler.recipeProgress = 0;
    }
  }

  transferAssemblerProducts(assembler) {
    if (!assembler.selectedRecipe || !assembler.outputInventory || assembler.outputInventory.length === 0) return;

    const maxConveyorInventory = 8;
    const maxStorageInventory = 250;

    const adjacentCheckList = [
      { pos: { x: assembler.position.x, y: assembler.position.y - 1 }, requiredDir: Direction.UP },
      { pos: { x: assembler.position.x + 1, y: assembler.position.y }, requiredDir: Direction.RIGHT },
      { pos: { x: assembler.position.x, y: assembler.position.y + 1 }, requiredDir: Direction.DOWN },
      { pos: { x: assembler.position.x - 1, y: assembler.position.y }, requiredDir: Direction.LEFT }
    ];

    let transferred = 0;
    const maxTransfers = 2;

    for (const check of adjacentCheckList) {
      if (assembler.outputInventory.length === 0 || transferred >= maxTransfers) break;

      const adjacentBuilding = this.gridSystem.getBuildingAt(check.pos.x, check.pos.y);

      if (adjacentBuilding && adjacentBuilding.type === BuildingType.CONVEYOR) {
        if (adjacentBuilding.direction === check.requiredDir) {
          if (adjacentBuilding.inventory.length < maxConveyorInventory) {
            const product = assembler.outputInventory.shift();
            adjacentBuilding.inventory.push(product);
            product.position = { x: adjacentBuilding.position.x, y: adjacentBuilding.position.y };
            transferred++;
          }
        }
      } else if (adjacentBuilding && adjacentBuilding.type === BuildingType.STORAGE) {
        if (adjacentBuilding.inventory.length < maxStorageInventory) {
          const product = assembler.outputInventory.shift();
          adjacentBuilding.inventory.push(product);
          product.position = { x: adjacentBuilding.position.x, y: adjacentBuilding.position.y };
          transferred++;
        }
      }
    }
  }

  transferStorageProducts(storage) {
    if (!storage.inventory || storage.inventory.length === 0) return;

    const maxConveyorInventory = 8;
    
    const adjacentCheckList = [
      { pos: { x: storage.position.x, y: storage.position.y - 1 }, requiredDir: Direction.UP },
      { pos: { x: storage.position.x + 1, y: storage.position.y }, requiredDir: Direction.RIGHT },
      { pos: { x: storage.position.x, y: storage.position.y + 1 }, requiredDir: Direction.DOWN },
      { pos: { x: storage.position.x - 1, y: storage.position.y }, requiredDir: Direction.LEFT }
    ];

    let transferred = 0;
    const maxTransfers = 1;

    for (const check of adjacentCheckList) {
      if (storage.inventory.length === 0 || transferred >= maxTransfers) break;

      const adjacentBuilding = this.gridSystem.getBuildingAt(check.pos.x, check.pos.y);

      if (adjacentBuilding && adjacentBuilding.type === BuildingType.CONVEYOR) {
        if (adjacentBuilding.direction === check.requiredDir) {
          if (adjacentBuilding.inventory.length < maxConveyorInventory) {
            const product = storage.inventory.shift();
            adjacentBuilding.inventory.push(product);
            product.position = { x: adjacentBuilding.position.x, y: adjacentBuilding.position.y };
            transferred++;
            logger.debug(`✅ Almacén en (${storage.position.x},${storage.position.y}) transfirió ${product.type} a cinta en dirección ${adjacentBuilding.direction}`);
          }
        }
      }
    }
  }

  render() {
    for (const resource of this.gameState.resources.values()) {
      if (resource.targetPosition) {
        const speed = 0.2;
        resource.progress = Math.min(1, resource.progress + speed);

        if (resource.progress >= 1) {
          resource.position = resource.targetPosition;
          resource.targetPosition = undefined;
          resource.progress = 0;
        }
      }
    }

    this.renderer.render(this.gameState, this.camera, this.gridSystem, this.placementMode);
  }

  gameLoopStep(currentTime) {
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = currentTime;
    }

    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    this.update(deltaTime);
    this.render();

    if (this.running) {
      this.animationFrameId = requestAnimationFrame((time) => this.gameLoopStep(time));
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.animationFrameId = requestAnimationFrame((time) => this.gameLoopStep(time));
    console.log("🎮 Juego iniciado");
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  saveGame() {
    const buildingsArray = Array.from(this.gameState.buildings.values()).map((b) => ({
      id: b.id,
      type: b.type,
      position: b.position,
      direction: b.direction,
      health: b.health,
    }));

    const saveData = {
      buildings: buildingsArray,
      resources: Array.from(this.gameState.resources.values()),
      playerInventory: this.gameState.playerInventory,
      gameTime: this.gameState.gameTime,
      playerLevel: this.gameState.playerLevel,
      playerExperience: this.gameState.playerExperience,
    };

    localStorage.setItem("factorio-save", JSON.stringify(saveData));
  }

  loadGame() {
    const saveData = localStorage.getItem("factorio-save");
    if (!saveData) return;

    try {
      const data = JSON.parse(saveData);

      data.buildings?.forEach((buildingData) => {
        this.placeBuilding(buildingData.type, buildingData.position.x, buildingData.position.y);
      });

      this.gameState.playerInventory = data.playerInventory;
      if (data.playerLevel !== undefined) this.gameState.playerLevel = data.playerLevel;
      if (data.playerExperience !== undefined) this.gameState.playerExperience = data.playerExperience;

      if (this.gameState.playerLevel >= 1) {
        this.gameState.unlockedBuildings.add(BuildingType.LABORATORY);
      }
      if (this.gameState.playerLevel >= 2) {
        this.gameState.unlockedBuildings.add(BuildingType.ADVANCED_ASSEMBLER);
      }
      if (this.gameState.playerLevel >= 3) {
        this.gameState.unlockedBuildings.add(BuildingType.REFINERY);
      }

      console.log("✓ Partida cargada");
    } catch (error) {
      console.error("Error al cargar partida:", error);
    }
  }
}
