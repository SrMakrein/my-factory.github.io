/**
 * Sistema de Cámara
 * Gestiona la visualización, zoom y pan de la pantalla
 */

class Camera {
  constructor(x = 0, y = 0, width = 800, height = 600) {
    this.position = { x, y };
    this.zoom = 1;
    this.minZoom = 0.5;
    this.maxZoom = 3;
    this.width = width;
    this.height = height;
  }

  panBy(dx, dy) {
    this.position.x += dx;
    this.position.y += dy;
  }

  zoomAt(factor, cursorX, cursorY) {
    const oldZoom = this.zoom;
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * factor));

    const zoomChange = (this.zoom - oldZoom) / oldZoom;
    this.position.x -= (cursorX / oldZoom) * zoomChange;
    this.position.y -= (cursorY / oldZoom) * zoomChange;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
  }

  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.position.x) * this.zoom,
      y: (worldY - this.position.y) * this.zoom,
    };
  }

  screenToWorld(screenX, screenY) {
    return {
      x: screenX / this.zoom + this.position.x,
      y: screenY / this.zoom + this.position.y,
    };
  }

  isVisible(x, y, size) {
    const screenPos = this.worldToScreen(x, y);
    const screenSize = size * this.zoom;
    return (
      screenPos.x + screenSize > 0 &&
      screenPos.x < this.width &&
      screenPos.y + screenSize > 0 &&
      screenPos.y < this.height
    );
  }
}
