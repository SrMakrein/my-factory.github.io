/**
 * Generador de Sprites
 * Crea sprites en canvas para recursos y edificios
 */

class SpriteGenerator {
  static generateResourceSprite(resourceType, size = 16) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Definir paleta de colores para pixel art
    const palettes = {
      iron: { main: "#8B8B8B", dark: "#5A5A5A", light: "#B0B0B0" },
      copper: { main: "#CD7F32", dark: "#944D1E", light: "#E8A76A" },
      coal: { main: "#2F2F2F", dark: "#0F0F0F", light: "#4A4A4A" },
      iron_plate: { main: "#A9A9A9", dark: "#6F6F6F", light: "#D3D3D3" },
      copper_plate: { main: "#E8A76A", dark: "#B8752A", light: "#F0B87A" },
      cable: { main: "#FFD700", dark: "#DAA520", light: "#FFFF00" },
      coil: { main: "#FF6B6B", dark: "#DC143C", light: "#FF8C8C" },
      construction_parts: { main: "#87CEEB", dark: "#4682B4", light: "#ADD8E6" },
    };

    const palette = palettes[resourceType] || palettes.iron;
    ctx.imageSmoothingEnabled = false;

    // Renderizar recurso según tipo
    this._drawResourceSprite(ctx, resourceType, size, palette);

    // Borde oscuro
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(2, 2, size - 4, size - 4);

    return canvas;
  }

  static _drawResourceSprite(ctx, resourceType, size, palette) {
    switch (resourceType) {
      case "iron":
        ctx.fillStyle = palette.main;
        ctx.fillRect(3, 3, 10, 10);
        ctx.fillStyle = palette.dark;
        ctx.fillRect(4, 4, 2, 2);
        ctx.fillRect(10, 5, 2, 2);
        ctx.fillRect(5, 10, 2, 2);
        ctx.fillStyle = palette.light;
        ctx.fillRect(9, 9, 2, 2);
        break;

      case "copper":
        ctx.fillStyle = palette.main;
        ctx.fillRect(3, 3, 10, 10);
        ctx.fillStyle = palette.dark;
        ctx.fillRect(3, 3, 3, 3);
        ctx.fillRect(10, 6, 2, 2);
        ctx.fillStyle = palette.light;
        ctx.fillRect(6, 8, 3, 2);
        ctx.fillRect(8, 6, 2, 2);
        break;

      case "coal":
        ctx.fillStyle = "#3a3a3a";
        ctx.fillRect(2, 2, size - 4, size - 4);
        ctx.fillStyle = palette.main;
        ctx.fillRect(3, 5, 4, 4);
        ctx.fillRect(8, 7, 4, 4);
        ctx.fillStyle = palette.dark;
        ctx.fillRect(3, 5, 2, 2);
        ctx.fillRect(8, 7, 2, 2);
        ctx.fillRect(5, 9, 2, 2);
        ctx.fillStyle = palette.light;
        ctx.fillRect(5, 6, 1, 1);
        ctx.fillRect(10, 9, 1, 1);
        break;

      case "iron_plate":
        ctx.fillStyle = palette.main;
        ctx.fillRect(2, 3, 12, 10);
        ctx.strokeStyle = palette.dark;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(2, 6);
        ctx.lineTo(14, 6);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2, 9);
        ctx.lineTo(14, 9);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(2, 12);
        ctx.lineTo(14, 12);
        ctx.stroke();
        ctx.fillStyle = palette.light;
        ctx.fillRect(3, 4, 10, 1);
        break;

      case "copper_plate":
        ctx.fillStyle = palette.main;
        ctx.fillRect(2, 3, 12, 10);
        ctx.strokeStyle = palette.dark;
        ctx.lineWidth = 1;
        for (let i = 0; i < 16; i += 2) {
          ctx.beginPath();
          ctx.moveTo(i, 3);
          ctx.lineTo(i + 8, 13);
          ctx.stroke();
        }
        ctx.fillStyle = palette.light;
        ctx.fillRect(3, 4, 2, 1);
        ctx.fillRect(9, 10, 2, 1);
        break;

      case "cable":
        ctx.fillStyle = "#2C3E50";
        ctx.fillRect(2, 2, 12, 12);
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(5, 8);
        ctx.quadraticCurveTo(4, 4, 7, 3);
        ctx.stroke();
        ctx.strokeStyle = "#FF6B6B";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(11, 8);
        ctx.quadraticCurveTo(12, 4, 9, 3);
        ctx.stroke();
        break;

      case "coil":
        ctx.fillStyle = "#C87137";
        ctx.beginPath();
        ctx.arc(8, 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(0, 0, 0, 0)";
        ctx.clearRect(6.5, 6.5, 3, 3);
        ctx.fillStyle = "#8B4513";
        ctx.beginPath();
        ctx.arc(8, 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#2C3E50";
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(8, 8, 3.5 - i * 0.5, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.strokeStyle = palette.light;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(8, 8, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(5.5, 5.5, 0.8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "construction_parts":
        ctx.fillStyle = palette.main;
        ctx.fillRect(2, 2, 12, 12);
        ctx.fillStyle = palette.dark;
        ctx.fillRect(4, 4, 3, 3);
        ctx.fillRect(9, 4, 3, 3);
        ctx.fillRect(4, 9, 3, 3);
        ctx.fillRect(9, 9, 3, 3);
        ctx.fillStyle = palette.light;
        ctx.fillRect(3, 3, 10, 1);
        ctx.fillRect(3, 3, 1, 10);
        break;
    }
  }

  static generateBuildingSprite(buildingType, direction, size = 32) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);

    ctx.fillStyle = "#333";
    ctx.font = `${size * 0.5}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const icons = {
      miner: "⛏",
      conveyor: "→",
      storage: "📦",
      smelter: "🔥",
      assembler: "⚙",
      laboratory: "🧪",
      advanced_assembler: "⚙️⚙️",
      refinery: "🏭",
    };

    const text = icons[buildingType] || "?";

    if (buildingType === "conveyor" && direction !== undefined) {
      ctx.save();
      ctx.translate(size / 2, size / 2);

      const rotations = {
        0: -Math.PI / 2,   // UP
        1: 0,              // RIGHT
        2: Math.PI / 2,    // DOWN
        3: Math.PI         // LEFT
      };

      ctx.rotate(rotations[direction] || 0);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(text, size / 2, size / 2);
    }

    return canvas;
  }

  static generateTerrainTile(tileSize, resourceType) {
    const canvas = document.createElement("canvas");
    canvas.width = tileSize;
    canvas.height = tileSize;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#1a5c1a";
    ctx.fillRect(0, 0, tileSize, tileSize);

    if (resourceType) {
      const colors = {
        iron: "#A0A0A0",
        copper: "#D4621D",
        coal: "#2A2A2A",
      };

      ctx.fillStyle = colors[resourceType] || "#888";
      ctx.beginPath();
      ctx.arc(tileSize / 2, tileSize / 2, tileSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  }
}
