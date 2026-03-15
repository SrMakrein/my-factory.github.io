// ============================================================================
// RENDERER - Sistema de renderizado
// ============================================================================

class Renderer {
  constructor(canvasId, spriteCache) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.spriteCache = spriteCache;

    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  render(gameState, camera, grid, placementMode) {
    // Limpiar botones del frame anterior
    if (window.gameLoopInstance) {
      window.gameLoopInstance.activeButtons = [];
    }
    
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.scale(camera.zoom, camera.zoom);
    this.ctx.translate(-camera.position.x, -camera.position.y);

    this.renderGrid(grid, camera);
    this.renderResourceNodes(grid, camera);
    this.renderBuildings(gameState, camera);
    this.renderResources(gameState);

    if (gameState.selectedBuilding) {
      this.renderBuildingSelection(gameState.selectedBuilding, gameState.gameTime);
    }

    this.ctx.restore();

    this.renderUI(gameState, camera, placementMode);
  }

  renderGrid(grid, camera) {
    const tileSize = grid.getTileSize();
    const gridTiles = grid.getGrid();

    for (let y = 0; y < gridTiles.length; y++) {
      for (let x = 0; x < gridTiles[y].length; x++) {
        if (camera.isVisible(x * tileSize, y * tileSize, tileSize)) {
          this.ctx.fillStyle = "#1a5c1a";
          this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

          this.ctx.strokeStyle = "#333";
          this.ctx.lineWidth = 0.5 / camera.zoom;
          this.ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }
  }

  renderResourceNodes(grid, camera) {
    const tileSize = grid.getTileSize();
    const gridTiles = grid.getGrid();

    for (let y = 0; y < gridTiles.length; y++) {
      for (let x = 0; x < gridTiles[y].length; x++) {
        const tile = gridTiles[y][x];
        if (tile.resource && camera.isVisible(x * tileSize, y * tileSize, tileSize)) {
          const sprite = this.spriteCache.getTerrainSprite(tile.resource.type);
          this.ctx.drawImage(sprite, x * tileSize + 4, y * tileSize + 4, tileSize - 8, tileSize - 8);

          this.ctx.fillStyle = "#fff";
          this.ctx.font = `${Math.max(8 / camera.zoom, 6)}px Arial`;
          this.ctx.textAlign = "right";
          this.ctx.fillText(tile.resource.quantity.toString(), x * tileSize + tileSize - 2, y * tileSize + tileSize - 2);
        }
      }
    }
  }

  renderBuildings(gameState, camera) {
    const tileSize = 32;

    for (const building of gameState.buildings.values()) {
      const x = building.position.x * tileSize;
      const y = building.position.y * tileSize;

      if (camera.isVisible(x, y, tileSize)) {
        const sprite = this.spriteCache.getBuildingSprite(building.type, building.direction);
        this.ctx.drawImage(sprite, x, y, tileSize, tileSize);

        // Mostrar estado activo
        if (building.isActive) {
          this.ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
          this.ctx.fillRect(x, y, tileSize, tileSize);

          const animTime = (gameState.gameTime % 1000) / 1000;
          this.ctx.strokeStyle = `rgba(0, 255, 0, ${0.5 + Math.sin(animTime * Math.PI * 2) * 0.3})`;
          this.ctx.lineWidth = 2 / camera.zoom;
          this.ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
        }

        // Mostrar progreso de receta
        if (building.recipeProgress > 0 && building.recipeProgress < 1) {
          this.ctx.fillStyle = "rgba(100, 200, 255, 0.3)";
          this.ctx.fillRect(x, y - 8, tileSize * building.recipeProgress, 4);
          this.ctx.strokeStyle = "rgba(100, 200, 255, 0.6)";
          this.ctx.lineWidth = 1 / camera.zoom;
          this.ctx.strokeRect(x, y - 8, tileSize, 4);
        }

        // Mostrar inventario
        if (building.inventory.length > 0) {
          if (building.type === BuildingType.STORAGE) {
            // Para almacenes: mostrar barra de capacidad + número de items
            const maxCapacity = 250;
            const capacity = (building.inventory.length / maxCapacity);
            this.ctx.fillStyle = "rgba(255, 100, 100, 0.5)";
            this.ctx.fillRect(x, y + tileSize - 4, tileSize * capacity, 4);
            this.ctx.strokeStyle = "rgba(255, 100, 100, 0.8)";
            this.ctx.lineWidth = 1 / camera.zoom;
            this.ctx.strokeRect(x, y + tileSize - 4, tileSize, 4);

            // Mostrar cantidad en esquina superior izquierda con fondo negro
            const numStr = building.inventory.length.toString();
            const fontSize = Math.max(8 / camera.zoom, 6);
            this.ctx.font = `${fontSize}px Arial`;
            this.ctx.textAlign = "center";
            
            const padding = 2;
            const textWidth = 14;
            const textHeight = fontSize + 2;
            const rectX = x + padding;
            const rectY = y + padding;
            
            // Dibujar fondo negro
            this.ctx.fillStyle = "#000000";
            this.ctx.fillRect(rectX, rectY, textWidth, textHeight);
            
            // Dibujar número en blanco
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillText(numStr, x + padding + textWidth / 2, y + fontSize + padding);

          } else if (building.type === BuildingType.CONVEYOR) {
            // Mostrar movimiento continuo de materiales en la cinta
            if (building.inventory.length > 0) {
              // Calcular dirección visual basada en la rotación
              const directions = [
                { dx: 0, dy: -1 }, // UP
                { dx: 1, dy: 0 },  // RIGHT
                { dx: 0, dy: 1 },  // DOWN
                { dx: -1, dy: 0 }  // LEFT
              ];
              const dir = directions[building.direction] || directions[1];
              
              // Animación de movimiento continuo (velocidad dividida por 2 = tiempo de 1000ms)
              const animTime = (gameState.gameTime / 1000) % 1;
              const itemsToShow = Math.min(building.inventory.length, 2);
              
              for (let i = 0; i < itemsToShow; i++) {
                const resource = building.inventory[i];
                const sprite = this.spriteCache.getResourceSprite(resource.type);
                
                // Posición animada a lo largo de la dirección con mayor espacio entre items
                const offset = (animTime + i * 0.5) % 1;
                const posX = x + tileSize / 2 + dir.dx * tileSize * (offset - 0.5) - 8;
                const posY = y + tileSize / 2 + dir.dy * tileSize * (offset - 0.5) - 8;
                
                this.ctx.drawImage(sprite, posX, posY, 16, 16);
              }
            }
            
          } else {
            // Para mineros y fundiciones: mostrar número en esquina superior derecha
            const maxMinerCapacity = building.type === BuildingType.MINER ? 25 : 20;
            
            // Mostrar cantidad si hay - en esquina superior derecha con fondo negro
            if (building.inventory.length > 0) {
              const numStr = building.inventory.length.toString();
              const fontSize = Math.max(8 / camera.zoom, 6);
              this.ctx.font = `${fontSize}px Arial`;
              this.ctx.textAlign = "center";
              
              const padding = 2;
              const textWidth = 14;
              const textHeight = fontSize + 2;
              const rectX = x + tileSize - textWidth - padding;
              const rectY = y + padding;
              
              // Dibujar fondo negro
              this.ctx.fillStyle = "#000000";
              this.ctx.fillRect(rectX, rectY, textWidth, textHeight);
              
              // Dibujar número en blanco
              this.ctx.fillStyle = "#ffffff";
              this.ctx.fillText(numStr, x + tileSize - textWidth / 2 - padding, y + fontSize + padding);
            }

            // Barra de capacidad
            this.ctx.fillStyle = building.type === BuildingType.MINER ? "rgba(255, 150, 100, 0.4)" : "rgba(100, 200, 255, 0.4)";
            this.ctx.fillRect(x, y + tileSize - 3, tileSize * (building.inventory.length / maxMinerCapacity), 3);
            this.ctx.strokeStyle = building.type === BuildingType.MINER ? "rgba(255, 150, 100, 0.8)" : "rgba(100, 200, 255, 0.8)";
            this.ctx.lineWidth = 1 / camera.zoom;
            this.ctx.strokeRect(x, y + tileSize - 3, tileSize, 3);
          }
        }
      }
    }
  }

  renderResources(gameState) {
    const tileSize = 32;

    for (const resource of gameState.resources.values()) {
      // NO renderizar recursos que están dentro de cintas (se muestran en la animación)
      let isInConveyor = false;
      for (const building of gameState.buildings.values()) {
        if (building.type === BuildingType.CONVEYOR && building.inventory.includes(resource)) {
          isInConveyor = true;
          break;
        }
      }
      
      if (isInConveyor) {
        continue; // Saltar este recurso, ya se dibuja en la animación de la cinta
      }

      const screenPos = {
        x: resource.position.x * tileSize + 8,
        y: resource.position.y * tileSize + 8,
      };

      if (resource.targetPosition) {
        const targetScreen = {
          x: resource.targetPosition.x * tileSize + 8,
          y: resource.targetPosition.y * tileSize + 8,
        };
        screenPos.x = screenPos.x + (targetScreen.x - screenPos.x) * resource.progress;
        screenPos.y = screenPos.y + (targetScreen.y - screenPos.y) * resource.progress;
      }

      const sprite = this.spriteCache.getResourceSprite(resource.type);
      this.ctx.drawImage(sprite, screenPos.x - 8, screenPos.y - 8, 16, 16);
    }
  }

  renderBuildingSelection(building, gameTime) {
    const tileSize = 32;
    const x = building.position.x * tileSize;
    const y = building.position.y * tileSize;

    // Highlight pulsante
    const animTime = (gameTime % 800) / 800;
    const pulseAlpha = 0.3 + Math.sin(animTime * Math.PI * 2) * 0.2;
    
    // Glow interno
    this.ctx.fillStyle = `rgba(0, 255, 0, ${pulseAlpha * 0.5})`;
    this.ctx.fillRect(x - 2, y - 2, tileSize + 4, tileSize + 4);
    
    // Borde principal
    this.ctx.strokeStyle = "#00ff00";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x, y, tileSize, tileSize);
    
    // Esquinas de enfoque
    this.ctx.strokeStyle = "#00ff00";
    this.ctx.lineWidth = 2;
    const cornerSize = 8;
    
    // Top-left
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + cornerSize);
    this.ctx.lineTo(x, y);
    this.ctx.lineTo(x + cornerSize, y);
    this.ctx.stroke();
    
    // Top-right
    this.ctx.beginPath();
    this.ctx.moveTo(x + tileSize - cornerSize, y);
    this.ctx.lineTo(x + tileSize, y);
    this.ctx.lineTo(x + tileSize, y + cornerSize);
    this.ctx.stroke();
    
    // Bottom-left
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + tileSize - cornerSize);
    this.ctx.lineTo(x, y + tileSize);
    this.ctx.lineTo(x + cornerSize, y + tileSize);
    this.ctx.stroke();
    
    // Bottom-right
    this.ctx.beginPath();
    this.ctx.moveTo(x + tileSize - cornerSize, y + tileSize);
    this.ctx.lineTo(x + tileSize, y + tileSize);
    this.ctx.lineTo(x + tileSize, y + tileSize - cornerSize);
    this.ctx.stroke();
  }

  renderUI(gameState, camera, placementMode) {
    // Renderizar feedback de modo colocacion si esta activo
    if (placementMode) {
      this.ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
      this.ctx.font = "bold 14px Arial";
      this.ctx.textAlign = "left";
      
      const buildingName = BuildingDescriptions[placementMode]?.name || placementMode;
      this.ctx.fillText(`📍 Colocando: ${buildingName}`, 10, 370);
      
      this.ctx.fillStyle = "rgba(0, 255, 0, 0.6)";
      this.ctx.font = "italic 11px Arial";
      this.ctx.fillText("Izq. para colocar | Der. para cancelar", 10, 388);
    }
    
    this.renderResourcePanel(gameState);
    this.renderResearchPanel(gameState);
    this.renderMissionPanel(gameState);
    this.renderInfoPanel(gameState);
    this.renderBuildingPanel(gameState);
  }

  renderResearchPanel(gameState) {
    const panelX = 10;
    const panelY = this.canvas.height - 180;
    const panelWidth = 250;
    const panelHeight = 80;

    this.ctx.fillStyle = "rgba(30, 30, 30, 0.95)";
    this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    this.ctx.strokeStyle = "#4a8a4a";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    this.ctx.fillStyle = "#4a8a4a";
    this.ctx.font = "bold 12px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText("🔬 INVESTIGACIÓN", panelX + 10, panelY + 18);

    this.ctx.fillStyle = "#ccc";
    this.ctx.font = "11px Arial";
    this.ctx.fillText(`Puntos: ${gameState.researchPoints}`, panelX + 10, panelY + 38);

    // Mostrar investigaciones completadas
    let completedResearch = 0;
    for (const research of Object.values(gameState.research)) {
      if (research.completed) completedResearch++;
    }
    this.ctx.fillText(`Completadas: ${completedResearch}/${Object.keys(gameState.research).length}`, panelX + 10, panelY + 55);
  }

  renderMissionPanel(gameState) {
    if (!gameState.missions || gameState.missions.length === 0) return;

    const panelX = this.canvas.width - 320;
    const panelY = this.canvas.height - 240;
    const panelWidth = 300;
    const panelHeight = 140;

    this.ctx.fillStyle = "rgba(30, 30, 30, 0.98)";
    this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    this.ctx.strokeStyle = "#d4a574";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    this.ctx.fillStyle = "#d4a574";
    this.ctx.font = "bold 13px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText("📋 MISIÓN ACTUAL", panelX + 10, panelY + 20);

    // Encontrar la primera misión incompleta
    const currentMission = gameState.missions.find(m => !m.completed);
    if (currentMission) {
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "bold 12px Arial";
      this.ctx.fillText(`${currentMission.name}`, panelX + 10, panelY + 40);
      
      this.ctx.fillStyle = "#ccc";
      this.ctx.font = "11px Arial";
      this.ctx.fillText(`${currentMission.description}`, panelX + 10, panelY + 57);
      
      const progress = Math.round((currentMission.progress / currentMission.quantity) * 100);
      
      // Barra de progreso
      const barWidth = panelWidth - 20;
      const barHeight = 8;
      const barX = panelX + 10;
      const barY = panelY + 70;
      
      // Fondo de la barra
      this.ctx.fillStyle = "#333";
      this.ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Barra de progreso
      this.ctx.fillStyle = "#d4a574";
      this.ctx.fillRect(barX, barY, barWidth * (progress / 100), barHeight);
      
      // Borde de la barra
      this.ctx.strokeStyle = "#d4a574";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(barX, barY, barWidth, barHeight);
      
      // Texto de progreso
      this.ctx.fillStyle = "#aaa";
      this.ctx.font = "10px Arial";
      this.ctx.fillText(`${progress}% (${currentMission.progress}/${currentMission.quantity})`, barX, barY + 22);
      
      // Recompensa
      this.ctx.fillStyle = "#ffd700";
      this.ctx.font = "bold 11px Arial";
      this.ctx.fillText(`Recompensa: +${currentMission.reward} puntos`, panelX + 10, barY + 35);
    } else {
      this.ctx.fillStyle = "#4a4";
      this.ctx.font = "bold 12px Arial";
      this.ctx.fillText("✓ ¡Todas las misiones completadas!", panelX + 10, panelY + 40);
    }
  }

  renderResourcePanel(gameState) {
    const panelHeight = 100;
    const panelY = this.canvas.height - panelHeight;

    this.ctx.fillStyle = "rgba(30, 30, 30, 0.95)";
    this.ctx.fillRect(0, panelY, this.canvas.width, panelHeight);

    this.ctx.strokeStyle = "#666";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, panelY, this.canvas.width, panelHeight);

    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 16px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Recursos en Almacenes", 10, panelY + 25);

    // Contar recursos en todos los almacenes
    const storageCounts = {};
    for (const building of gameState.buildings.values()) {
      if (building.type === BuildingType.STORAGE) {
        for (const resource of building.inventory) {
          storageCounts[resource.type] = (storageCounts[resource.type] || 0) + 1;
        }
      }
    }

    const resourceEntries = Object.entries(storageCounts);
    let xOffset = 220;

    resourceEntries.forEach(([resourceType, amount]) => {
      this.ctx.fillStyle = "#ccc";
      this.ctx.font = "12px Arial";
      this.ctx.fillText(`${resourceType}: ${amount}`, xOffset, panelY + 25);
      xOffset += 150;
    });

    // Mostrar nivel y experiencia
    this.ctx.fillStyle = "#ffff00";
    this.ctx.font = "bold 14px Arial";
    this.ctx.textAlign = "left";
    const currentLevelRequirement = gameState.experiencePerLevel * gameState.playerLevel;
    this.ctx.fillText(`⭐ NIVEL ${gameState.playerLevel}`, 10, panelY + 50);
    
    this.ctx.fillStyle = "#ffff88";
    this.ctx.font = "12px Arial";
    this.ctx.fillText(`EXP: ${gameState.playerExperience}/${currentLevelRequirement}`, 10, panelY + 70);

    // Barra de experiencia
    const expBarX = 190;
    const expBarY = panelY + 55;
    const expBarWidth = 200;
    const expBarHeight = 12;
    
    this.ctx.fillStyle = "rgba(100, 100, 100, 0.5)";
    this.ctx.fillRect(expBarX, expBarY, expBarWidth, expBarHeight);
    
    const expProgress = Math.min(gameState.playerExperience / currentLevelRequirement, 1);
    this.ctx.fillStyle = "#ffff00";
    this.ctx.fillRect(expBarX, expBarY, expBarWidth * expProgress, expBarHeight);
    
    this.ctx.strokeStyle = "#ffff00";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(expBarX, expBarY, expBarWidth, expBarHeight);

    this.ctx.fillStyle = "#888";
    this.ctx.font = "11px Arial";
    this.ctx.textAlign = "right";
    this.ctx.fillText(
      "M:Minero | C:Cinta | A:Almacén | F:Fundición | E:Ensamblador | L:Lab | Espacio:Pausa",
      this.canvas.width - 130,
      panelY + 25
    );

    this.ctx.fillText(
      "U:Ens.Avanzado (Nv.2) | P:Refería (Nv.3) | S:Guardar",
      this.canvas.width - 130,
      panelY + 45
    );
  }

  renderInfoPanel(gameState) {
    if (!gameState.selectedBuilding) return;

    const building = gameState.selectedBuilding;
    const description = BuildingDescriptions[building.type];
    
    // Panel más grande y reutilizable
    const panelWidth = Math.floor(this.canvas.width * 0.35);
    const panelHeight = Math.floor(this.canvas.height * 0.85);
    const panelX = this.canvas.width - panelWidth;
    const panelY = 10;

    // Fondo del panel
    this.ctx.fillStyle = "rgba(30, 30, 30, 0.98)";
    this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

    // Borde del panel - Verde para indicar selección
    this.ctx.strokeStyle = "#00ff00";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

    // Inicializar posición para contenido
    const padding = 15;
    let contentX = panelX + padding;
    let contentY = panelY + padding;
    const contentWidth = panelWidth - padding * 2;

    // Título (nombre del edificio con emoji)
    this.ctx.fillStyle = "#00ff00";
    this.ctx.font = "bold 18px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(description?.name || building.type.toUpperCase(), contentX, contentY);
    contentY += 30;

    // Descripción corta
    this.ctx.fillStyle = "#88ff88";
    this.ctx.font = "italic 13px Arial";
    const descriptionText = description?.description || "Edificio de producción";
    this.ctx.fillText(descriptionText, contentX, contentY);
    contentY += 25;

    // Línea separadora
    this.ctx.strokeStyle = "#00ff0040";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(contentX, contentY);
    this.ctx.lineTo(contentX + contentWidth, contentY);
    this.ctx.stroke();
    contentY += 15;

    // Información básica
    this.ctx.fillStyle = "#ccc";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "left";
    
    // Posición
    this.ctx.fillText(`📍 Posición: (${building.position.x}, ${building.position.y})`, contentX, contentY);
    contentY += 18;
    
    // Salud
    this.ctx.fillText(`❤️ Salud: ${building.health}/${building.maxHealth}`, contentX, contentY);
    contentY += 18;
    
    // Estado
    const statusEmoji = building.isActive ? "🟢" : "🔴";
    const statusText = building.isActive ? "ACTIVO" : "INACTIVO";
    this.ctx.fillStyle = building.isActive ? "#00ff00" : "#ff6b6b";
    this.ctx.fillText(`${statusEmoji} Estado: ${statusText}`, contentX, contentY);
    contentY += 25;

    // Detalles del edificio
    this.ctx.fillStyle = "#88ff88";
    this.ctx.font = "bold 12px Arial";
    this.ctx.fillText("ℹ️ Especificaciones:", contentX, contentY);
    contentY += 18;

    // Mostrar detalles según descripción
    if (description?.details) {
      this.ctx.fillStyle = "#aaa";
      this.ctx.font = "11px Arial";
      for (const detail of description.details) {
        this.ctx.fillText("  • " + detail, contentX, contentY);
        contentY += 14;
        if (contentY > panelY + panelHeight - 100) break;
      }
    }

    contentY += 10;
    
    // Sección específica por tipo de edificio
    if (building.type === BuildingType.CONVEYOR) {
      this.renderConveyorPanel(building, contentX, contentY, contentWidth);
    } else if (building.type === BuildingType.SMELTER) {
      this.renderSmelterPanel(building, contentX, contentY, contentWidth);
    } else if (building.type === BuildingType.ASSEMBLER) {
      this.renderAssemblerPanel(building, contentX, contentY, contentWidth);
    } else {
      this.renderGenericInventoryPanel(building, contentX, contentY, contentWidth);
    }
  }

  renderConveyorPanel(building, x, y, width) {
    const directions = ["↑", "→", "↓", "←"];
    
    this.ctx.fillStyle = "#ccc";
    this.ctx.font = "12px Arial";
    this.ctx.fillText(`Dirección: ${directions[building.direction]}`, x, y);
    y += 25;
    
    this.ctx.fillText("Rotar dirección:", x, y);
    y += 20;
    
    // Botones de dirección
    this.ctx.fillStyle = "#666";
    this.ctx.strokeStyle = "#999";
    this.ctx.lineWidth = 1;
    const btnWidth = 50;
    const btnHeight = 20;
    const spacing = 65;
    
    // UP
    this.ctx.fillRect(x, y, btnWidth, btnHeight);
    this.ctx.strokeRect(x, y, btnWidth, btnHeight);
    this.ctx.fillStyle = building.direction === Direction.UP ? "#00ff00" : "#fff";
    this.ctx.font = "11px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText("↑ UP", x + btnWidth / 2, y + 14);
    
    if (window.gameLoopInstance && window.gameLoopInstance.activeButtons) {
      window.gameLoopInstance.activeButtons.push({
        x: x,
        y: y,
        width: btnWidth,
        height: btnHeight,
        type: 'conveyor_direction',
        direction: Direction.UP,
        onClick: () => {
          building.direction = Direction.UP;
          console.log("Dirección: ↑ UP");
        }
      });
    }
    
    // RIGHT
    this.ctx.fillStyle = "#666";
    this.ctx.fillRect(x + spacing, y, btnWidth, btnHeight);
    this.ctx.strokeStyle = "#999";
    this.ctx.strokeRect(x + spacing, y, btnWidth, btnHeight);
    this.ctx.fillStyle = building.direction === Direction.RIGHT ? "#00ff00" : "#fff";
    this.ctx.fillText("→ RGT", x + spacing + btnWidth / 2, y + 14);
    
    if (window.gameLoopInstance && window.gameLoopInstance.activeButtons) {
      window.gameLoopInstance.activeButtons.push({
        x: x + spacing,
        y: y,
        width: btnWidth,
        height: btnHeight,
        type: 'conveyor_direction',
        direction: Direction.RIGHT,
        onClick: () => {
          building.direction = Direction.RIGHT;
          console.log("Dirección: → RIGHT");
        }
      });
    }
    
    y += 30;
    
    // DOWN
    this.ctx.fillStyle = "#666";
    this.ctx.fillRect(x, y, btnWidth, btnHeight);
    this.ctx.strokeStyle = "#999";
    this.ctx.strokeRect(x, y, btnWidth, btnHeight);
    this.ctx.fillStyle = building.direction === Direction.DOWN ? "#00ff00" : "#fff";
    this.ctx.fillText("↓ DWN", x + btnWidth / 2, y + 14);
    
    if (window.gameLoopInstance && window.gameLoopInstance.activeButtons) {
      window.gameLoopInstance.activeButtons.push({
        x: x,
        y: y,
        width: btnWidth,
        height: btnHeight,
        type: 'conveyor_direction',
        direction: Direction.DOWN,
        onClick: () => {
          building.direction = Direction.DOWN;
          console.log("Dirección: ↓ DOWN");
        }
      });
    }
    
    // LEFT
    this.ctx.fillStyle = "#666";
    this.ctx.fillRect(x + spacing, y, btnWidth, btnHeight);
    this.ctx.strokeStyle = "#999";
    this.ctx.strokeRect(x + spacing, y, btnWidth, btnHeight);
    this.ctx.fillStyle = building.direction === Direction.LEFT ? "#00ff00" : "#fff";
    this.ctx.fillText("← LFT", x + spacing + btnWidth / 2, y + 14);
    
    if (window.gameLoopInstance && window.gameLoopInstance.activeButtons) {
      window.gameLoopInstance.activeButtons.push({
        x: x + spacing,
        y: y,
        width: btnWidth,
        height: btnHeight,
        type: 'conveyor_direction',
        direction: Direction.LEFT,
        onClick: () => {
          building.direction = Direction.LEFT;
          console.log("Dirección: ← LEFT");
        }
      });
    }
  }

  renderSmelterPanel(building, x, y, width) {
    this.ctx.fillStyle = "#ccc";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "left";
    
    const fuelCount = building.fuelInventory ? building.fuelInventory.length : 0;
    const materialCount = building.materialInventory ? building.materialInventory.length : 0;
    
    // Combustible
    this.ctx.fillText("Combustible:", x, y);
    y += 14;
    if (fuelCount > 0) {
      const fuelSprite = this.spriteCache.getResourceSprite(ResourceType.COAL);
      this.ctx.drawImage(fuelSprite, x, y - 10, 14, 14);
      this.ctx.fillText(`${fuelCount}`, x + 20, y);
    } else {
      this.ctx.fillText(`${fuelCount}`, x + 20, y);
    }
    y += 16;
    
    // Material
    this.ctx.fillText("Material:", x, y);
    y += 14;
    if (materialCount > 0 && building.materialInventory.length > 0) {
      const materialType = building.materialInventory[0].type;
      const materialSprite = this.spriteCache.getResourceSprite(materialType);
      this.ctx.drawImage(materialSprite, x, y - 10, 14, 14);
      this.ctx.fillText(`${materialCount}`, x + 20, y);
    } else {
      this.ctx.fillText(`${materialCount}`, x + 20, y);
    }
    y += 16;
    
    // Producto
    this.ctx.fillText("Producto:", x, y);
    y += 14;
    if (building.inventory.length > 0) {
      const productSprite = this.spriteCache.getResourceSprite(building.inventory[0].type);
      this.ctx.drawImage(productSprite, x, y - 10, 14, 14);
      this.ctx.fillText(`${building.inventory.length}`, x + 20, y);
    } else {
      this.ctx.fillText(`${building.inventory.length}`, x + 20, y);
    }
  }

  renderAssemblerPanel(building, x, y, width) {
    this.ctx.fillStyle = "#ccc";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "left";
    
    // Seleccionar receta
    this.ctx.fillText("Seleccionar receta:", x, y);
    y += 25;
    
    const recipes = [
      { name: "Cable", value: "cable", color: "#FFD700" },
      { name: "Bobina", value: "coil", color: "#FF6B6B" },
      { name: "Piezas Const.", value: "construction_parts", color: "#87CEEB" }
    ];
    
    const btnWidth = Math.floor((width - 10) / 2);
    const btnHeight = 22;
    const btnSpacingX = 10;
    const btnSpacingY = 28;
    
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];
      const btnX = x + (i % 2) * (btnWidth + btnSpacingX);
      const btnY = y + Math.floor(i / 2) * btnSpacingY;
      
      const isSelected = building.selectedRecipe === recipe.value;
      this.ctx.fillStyle = isSelected ? recipe.color : "#555";
      this.ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
      this.ctx.strokeStyle = isSelected ? "#fff" : "#999";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);
      
      this.ctx.fillStyle = isSelected ? "#000" : "#fff";
      this.ctx.font = "11px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(recipe.name, btnX + btnWidth / 2, btnY + 16);
      
      // Registrar botón clickeable
      if (window.gameLoopInstance && window.gameLoopInstance.activeButtons) {
        const existingIndex = window.gameLoopInstance.activeButtons.findIndex(b => 
          b.type === 'assembler_recipe' && b.recipe === recipe.value
        );
        if (existingIndex >= 0) {
          window.gameLoopInstance.activeButtons.splice(existingIndex, 1);
        }
        window.gameLoopInstance.activeButtons.push({
          x: btnX,
          y: btnY,
          width: btnWidth,
          height: btnHeight,
          type: 'assembler_recipe',
          recipe: recipe.value,
          onClick: () => {
            building.selectedRecipe = recipe.value;
            building.recipeProgress = 0;
            console.log(`Receta seleccionada: ${recipe.name}`);
          }
        });
      }
    }
    
    y += 100;
    
    // Inventarios
    this.ctx.fillStyle = "#ccc";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "left";
    
    // Entrada
    this.ctx.fillText("Entrada:", x, y);
    if (building.inputInventory && building.inputInventory.length > 0) {
      y += 18;
      const resourcesMap = {};
      for (const resource of building.inputInventory) {
        resourcesMap[resource.type] = (resourcesMap[resource.type] || 0) + 1;
      }
      this.ctx.font = "11px Arial";
      for (const [type, count] of Object.entries(resourcesMap)) {
        const sprite = this.spriteCache.getResourceSprite(type);
        this.ctx.drawImage(sprite, x, y - 11, 12, 12);
        this.ctx.fillText(`${count}`, x + 18, y);
        y += 16;
      }
    } else {
      this.ctx.fillText("(vacío)", x + 80, y);
      y += 18;
    }
    
    y += 10;
    
    // Salida
    this.ctx.fillStyle = "#ccc";
    this.ctx.font = "12px Arial";
    this.ctx.fillText("Salida:", x, y);
    if (building.outputInventory && building.outputInventory.length > 0) {
      y += 18;
      const resourcesMap = {};
      for (const resource of building.outputInventory) {
        resourcesMap[resource.type] = (resourcesMap[resource.type] || 0) + 1;
      }
      this.ctx.font = "11px Arial";
      for (const [type, count] of Object.entries(resourcesMap)) {
        const sprite = this.spriteCache.getResourceSprite(type);
        this.ctx.drawImage(sprite, x, y - 11, 12, 12);
        this.ctx.fillText(`${count}`, x + 18, y);
        y += 16;
      }
    } else {
      this.ctx.fillText("(vacío)", x + 80, y);
      y += 18;
    }
    
    y += 10;
    
    // Estado
    this.ctx.fillStyle = building.isActive ? "#00ff00" : "#ff4444";
    this.ctx.font = "12px Arial";
    const statusText = building.isActive ? "✓ Activo" : "✗ Inactivo";
    this.ctx.fillText(`Estado: ${statusText}`, x, y);
    if (building.selectedRecipe) {
      y += 18;
      this.ctx.fillStyle = "#888";
      this.ctx.fillText(`Progreso: ${(building.recipeProgress * 100).toFixed(0)}%`, x, y);
    }
  }

  renderGenericInventoryPanel(building, x, y, width) {
    this.ctx.fillStyle = "#ccc";
    this.ctx.font = "12px Arial";
    this.ctx.textAlign = "left";

    this.ctx.fillText("Inventario:", x, y);
    y += 18;

    const resourceCounts = {};
    const inventory = Array.isArray(building.inventory) ? building.inventory : [];
    for (const resource of inventory) {
      resourceCounts[resource.type] = (resourceCounts[resource.type] || 0) + 1;
    }

    if (Object.keys(resourceCounts).length === 0) {
      this.ctx.fillStyle = "#888";
      this.ctx.fillText("(vacío)", x, y);
      y += 18;
    } else {
      this.ctx.fillStyle = "#ccc";
      this.ctx.font = "11px Arial";
      for (const [resourceType, count] of Object.entries(resourceCounts)) {
        const sprite = this.spriteCache.getResourceSprite(resourceType);
        this.ctx.drawImage(sprite, x, y - 11, 12, 12);
        this.ctx.fillText(`${resourceType}: ${count}`, x + 18, y);
        y += 16;
      }
    }

    y += 12;
    this.ctx.fillStyle = building.isActive ? "#00ff00" : "#ff4444";
    this.ctx.font = "12px Arial";
    this.ctx.fillText(`Estado: ${building.isActive ? "✓ Activo" : "✗ Inactivo"}`, x, y);

    // Mostrar inventario de salida si existe
    if (building.outputInventory && building.outputInventory.length > 0) {
      y += 18;
      this.ctx.fillStyle = "#ffff00";
      this.ctx.font = "11px Arial";
      const outputCounts = {};
      for (const resource of building.outputInventory) {
        outputCounts[resource.type] = (outputCounts[resource.type] || 0) + 1;
      }
      this.ctx.fillText("Salida:", x, y);
      y += 14;
      for (const [resourceType, count] of Object.entries(outputCounts)) {
        const sprite = this.spriteCache.getResourceSprite(resourceType);
        this.ctx.drawImage(sprite, x, y - 9, 10, 10);
        this.ctx.fillText(`${resourceType}: ${count}`, x + 15, y);
        y += 12;
      }
    }
  }

  renderBuildingPanel(gameState) {
    const panelWidth = 200;
    const panelHeight = 330;

    this.ctx.fillStyle = "rgba(30, 30, 30, 0.95)";
    this.ctx.fillRect(10, 10, panelWidth, panelHeight);

    this.ctx.strokeStyle = "#666";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(10, 10, panelWidth, panelHeight);

    this.ctx.fillStyle = "#fff";
    this.ctx.font = "bold 14px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Edificios", 20, 35);

    const buildings = [
      { name: "Minero", key: "M", type: BuildingType.MINER },
      { name: "Cinta", key: "C", type: BuildingType.CONVEYOR },
      { name: "Almacén", key: "A", type: BuildingType.STORAGE },
      { name: "Fundición", key: "F", type: BuildingType.SMELTER },
      { name: "Ensamblador", key: "E", type: BuildingType.ASSEMBLER },
      { name: "Laboratorio", key: "L", type: BuildingType.LABORATORY },
      { name: "Ens.Avanzado (Nv.2)", key: "U", type: BuildingType.ADVANCED_ASSEMBLER },
      { name: "Refinería (Nv.3)", key: "P", type: BuildingType.REFINERY },
    ];

    this.ctx.fillStyle = "#aaa";
    this.ctx.font = "11px Arial";
    buildings.forEach((building, index) => {
      const isUnlocked = gameState?.unlockedBuildings?.has(building.type) ?? (building.type === BuildingType.MINER || building.type === BuildingType.CONVEYOR || building.type === BuildingType.STORAGE);
      const color = isUnlocked ? "#0f0" : "#999";
      const status = isUnlocked ? "" : " 🔒";
      this.ctx.fillStyle = color;
      this.ctx.fillText(`[${building.key}] ${building.name}${status}`, 20, 60 + index * 25);
    });
  }
}
