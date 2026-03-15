/**
 * Estructura de Directorios - README
 * 
 * Descripción de la organización modular del proyecto Factorio Web
 */

# 📂 Estructura de Módulos

```
src/
├── core/                     # Configuración y constantes
│   ├── constants.js         # ResourceType, BuildingType, Direction, GameConfig, BuildingDescriptions
│   └── game-loop.js         # (Próximo: clase GameLoop)
│
├── systems/                 # Sistemas de juego
│   ├── grid-system.js       # (Próximo: clase GridSystem)
│   ├── camera-system.js     # (Próximo: clase Camera)
│   └── input-handler.js     # Manejo de entrada del usuario
│
├── rendering/               # Renderización y gráficos
│   ├── sprite-generator.js  # ✅ SpriteGenerator
│   ├── sprite-cache.js      # (Próximo: clase SpriteCache)
│   └── renderer.js          # (Próximo: clase Renderer)
│
├── gameplay/                # Lógica de juego
│   ├── building-system.js   # (Próximo: placeBuilding, updateBuilding)
│   ├── resource-system.js   # (Próximo: generación y consumo de recursos)
│   ├── experience-system.js # (Próximo: levelUp, addExperience)
│   └── research-system.js   # (Próximo: processResearch)
│
├── ui/                      # Interfaz de usuario
│   ├── console-logger.js    # ✅ ConsoleLogger
│   ├── panels.js            # (Próximo: renderUI, paneles)
│   └── hud.js               # (Próximo: elementos HUD)
│
└── data/                    # Datos estáticos
    ├── research-tree.js     # ✅ ResearchTree
    ├── mission-system.js    # ✅ MissionSystem
    └── building-descriptions.js # (En constants.js)
```

## ✅ Módulos Completados

- `src/core/constants.js` - Todos los tipos, constantes y descripciones
- `src/data/research-tree.js` - Árbol de investigación
- `src/data/mission-system.js` - Sistema de misiones
- `src/ui/console-logger.js` - Logger de consola
- `src/rendering/sprite-generator.js` - Generador de sprites

## 📝 Próximos Pasos

1. Extraer GridSystem → `src/systems/grid-system.js`
2. Extraer Camera → `src/systems/camera-system.js`
3. Extraer SpriteCache → `src/rendering/sprite-cache.js`
4. Extraer Renderer → `src/rendering/renderer.js`
5. Extraer GameLoop → `src/core/game-loop.js`
6. Extraer sistemas de gameplay
7. Actualizar index.html con importaciones

## 🔗 Orden de Carga

El archivo `index.html` debe cargar los módulos en este orden:

1. **Constants & Config** - src/core/constants.js
2. **Data** - src/data/*
3. **UI & Logging** - src/ui/console-logger.js
4. **Rendering** - src/rendering/*
5. **Systems** - src/systems/*
6. **Gameplay** - src/gameplay/*
7. **Core Logic** - src/core/game-loop.js

## 💡 Beneficios de la Modularización

- ✅ Código más organizado y mantenible
- ✅ Reutilización de módulos
- ✅ Menor complejidad por archivo
- ✅ Facilita testing y debugging
- ✅ Mejor división de responsabilidades
- ✅ Documentación clara por módulo
