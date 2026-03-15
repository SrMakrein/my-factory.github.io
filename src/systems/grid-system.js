/**
 * Sistema de Malla/Grid
 * Gestiona la disposición de la malla del juego, edificios y recursos
 */

class GridSystem {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.grid = [];
    this.tileSize = 32;
    this.initializeGrid();
  }

  initializeGrid() {
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = {
          x,
          y,
          terrain: "grass",
        };

        if (Math.random() < 0.08) {
          const resourceTypes = [ResourceType.IRON, ResourceType.COPPER, ResourceType.COAL];
          const randomType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
          this.grid[y][x].resource = {
            type: randomType,
            quantity: 500,
          };
        }
      }
    }
  }

  getTile(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.grid[y][x];
    }
    return null;
  }

  getGrid() {
    return this.grid;
  }

  canPlaceBuilding(x, y) {
    const tile = this.getTile(x, y);
    if (!tile) return false;
    return !tile.building;
  }

  placeBuilding(x, y, building) {
    const tile = this.getTile(x, y);
    if (!tile) {
      return false;
    }
    if (tile.building) {
      return false;
    }
    tile.building = building;
    return true;
  }

  removeBuilding(x, y) {
    const tile = this.getTile(x, y);
    if (tile && tile.building) {
      const building = tile.building;
      tile.building = undefined;
      return building;
    }
    return null;
  }

  getBuildingAt(x, y) {
    const tile = this.getTile(x, y);
    return tile?.building;
  }

  getResourceAt(x, y) {
    const tile = this.getTile(x, y);
    return tile?.resource;
  }

  extractResource(x, y, amount) {
    const resource = this.getResourceAt(x, y);
    if (!resource) return 0;

    const extracted = Math.min(amount, resource.quantity);
    resource.quantity -= extracted;

    if (resource.quantity <= 0) {
      const tile = this.getTile(x, y);
      if (tile) {
        tile.resource = undefined;
      }
    }

    return extracted;
  }

  getTileSize() {
    return this.tileSize;
  }

  setTileSize(size) {
    this.tileSize = size;
  }
}
