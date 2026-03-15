/**
 * Cache de Sprites
 * Almacena sprites generados en caché para mejorar rendimiento
 */

class SpriteCache {
  constructor() {
    this.cache = new Map();
  }

  getResourceSprite(type) {
    const key = `resource_${type}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, SpriteGenerator.generateResourceSprite(type));
    }
    return this.cache.get(key);
  }

  getBuildingSprite(type, direction) {
    const key = direction !== undefined ? `building_${type}_${direction}` : `building_${type}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, SpriteGenerator.generateBuildingSprite(type, direction));
    }
    return this.cache.get(key);
  }

  getTerrainSprite(type) {
    const key = `terrain_${type || "empty"}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, SpriteGenerator.generateTerrainTile(32, type));
    }
    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
  }
}
