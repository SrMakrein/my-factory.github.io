# 🏭 Factorio Web - Juego de Automatización

Una implementación web completa de un juego de automatización tipo Factorio, construido con **vanilla JavaScript** sin dependencias externas.

## 🎮 Estado Actual

**VERSIÓN: 2.0 - SISTEMAS DE INVESTIGACIÓN Y MISIONES**

El juego es totalmente funcional con nuevos sistemas de progresión:
- ✅ Sistema de extracción de recursos (minería)
- ✅ Sistema de transporte (cintas direccionales)
- ✅ Sistema de almacenamiento (almacenes de 250 items)
- ✅ Sistema de procesamiento (fundiciones y ensambladores)
- ✅ **NUEVO: Sistema de Investigación** - Árbol tech con 7 investigaciones
- ✅ **NUEVO: Sistema de Misiones** - 5 objetivos progresivos
- ✅ **NUEVO: Desbloqueo Dinámico** - Edificios se desbloquean mediante investigación
- ✅ Interfaz de usuario expandida (paneles de investigación y misiones)
- ✅ Sistema de persistencia (localStorage)
- ✅ Cámara con pan y zoom
- ✅ Sin dependencias externas

## 🚀 Inicio Rápido

### En tu navegador local:
- Simplemente abre `index.html` en tu navegador
- No requiere servidor, Node.js, ni dependencias

### En GitHub Pages:
- Todos los archivos están listos para deployar
- Solo necesitas hacer push al repositorio
- El juego estará disponible en `https://tuusuario.github.io/tu-repo`

## 🎮 Controles Básicos:

- **M** - Seleccionar modo Minero (siempre disponible)
- **C** - Seleccionar modo Cinta (siempre disponible)
- **A** - Seleccionar modo Almacén (siempre disponible)
- **F** - Seleccionar modo Fundición (requiere investigación)
- **E** - Seleccionar modo Ensamblador (requiere investigación)
- **Click Izquierdo** - Colocar edificio / Hacer clic en botones de UI
- **Rueda del Ratón** - Zoom in/out
- **Click Derecho + Arrastrar** - Mover cámara
- **Rueda Central** - Eliminar edificio (purga contenido)
- **R** - Rotar cinta (cuando está seleccionada)
- **T** - Panel de investigación (próximamente expandido)
- **Espacio** - Pausa/Reanuda
- **S** - Guardar partida

## 🏭 Edificios

### Minero ⛏️
- **Función:** Extrae recursos del terreno
- **Producción:** 2 items/tick
- **Capacidad:** 25 items
- **Entrada:** Nodos de recurso en el terreno
- **Salida:** Cinta o almacén adyacente

## 🔬 Sistema de Investigación (NUEVO)

El juego ahora incluye un **árbol de investigación** que desbloquea edificios progresivamente:

### Árbol de Investigación

```
NIVEL 1 - INDUSTRIA BÁSICA
├─ Fundición Básica (50 pts)
│  └─ Desbloquea: Fundición 🔥
│     └─ Costo: Producir hierro + carbón
│
└─ Ensamblaje Básico (100 pts, requiere Fundición)
   └─ Desbloquea: Ensamblador ⚙️
      └─ Permite crear cables, bobinas, piezas

NIVEL 2 - LOGÍSTICA AVANZADA
├─ Enrutamiento de Artículos (150 pts, requiere Ensamblaje)
│  └─ Desbloquea: Splitter ⊥
│     └─ Divide flujos de recursos en dos direcciones
│
└─ Filtrado de Artículos (200 pts, requiere Enrutamiento)
   └─ Desbloquea: Filtro 🔍
      └─ Filtra recursos por tipo

NIVEL 3 - AUTOMATIZACIÓN EXPERTA
├─ Transporte Rápido (250 pts, requiere Filtrado)
│  └─ Mejora: Aumenta velocidad de cintas
│
└─ Insertores Automáticos (300 pts, requiere Transporte)
   └─ Desbloquea: Inserter ▶
      └─ Transferencias de 1-a-1 precisas
```

### Cómo Funciona la Investigación

1. **Las misiones completadas otorgan puntos** de investigación
2. **Los puntos se acumulan** automáticamente en `gameState.researchPoints`
3. **Las investigaciones requieren X puntos** para completarse
4. **Al completarse, desbloquean nuevos edificios** automáticamente
5. **Los requisitos previos bloquean investigaciones** hasta completarlas

### Ganancia de Puntos de Investigación

- Misión: Primer Lingote → +100 puntos
- Misión: Maestro de Minerales → +150 puntos
- Misión: Producción en Serie → +200 puntos
- Misión: Ingeniero Completo → +500 puntos
- Misión: Fábrica Compleja → +300 puntos

---

## 📋 Sistema de Misiones (NUEVO)

El juego incluye **5 misiones progresivas** que marcan el ritmo del gameplay:

### Misiones Disponibles

| Misión | Descripción | Objetivo | Recompensa |
|--------|-------------|----------|-----------|
| 🎯 Primer Lingote | Produce 10 placas de hierro | 10x iron_plate | +100 pts |
| ⛏️ Maestro de Minerales | Minería de 50 recursos totales | 50 recursos | +150 pts |
| 🔧 Producción en Serie | Produce 20 cables | 20x cable | +200 pts |
| 🔬 Ingeniero Completo | Desbloquea 3 investigaciones básicas | 3 investigaciones | +500 pts |
| 🏭 Fábrica Compleja | Utiliza 5 tipos de edificios diferentes | 5 tipos | +300 pts |

### Progreso de Misiones

- Las misiones **se actualizan automáticamente** cada tick
- **Panel de misiones** muestra la misión actual y progreso
- **Al completar**, la siguiente misión se activa automáticamente
- **Progreso visual** en el panel inferior derecho

---

## 🎯 Cómo Jugar (v2.0)

### Fase 1: Primeros Pasos (Minería Básica)
1. Coloca un **minero (M)** sobre un nodo de recurso
2. Coloca **cintas (C)** para transportar recursos
3. Crea un **almacén (A)** para guardar producción
4. **Completa "Primer Lingote"** → +100 puntos

### Fase 2: Primeras Investigaciones (Procesamiento)
5. Con 100+ puntos, **investiga "Fundición Básica"**
6. Coloca una **fundición (F)** y conecta minero → fundición → almacén
7. Convierte minerales en placas
8. **Completa "Maestro de Minerales"** → +150 puntos

### Fase 3: Ensamblaje y Cables (Producción)
9. Investiga **"Ensamblaje Básico"** cuando tengas 100+ puntos extra
10. Coloca un **ensamblador (E)**
11. Configura receta: **Cable** (2x cobre_plate → 1x cable)
12. **Completa "Producción en Serie"** → +200 puntos

### Fase 4: Expansión Logística (Nivel Avanzado)
13. Investiga **"Enrutamiento de Artículos"** para desbloquear Splitter
14. Investiga **"Filtrado de Artículos"** para desbloquear Filtro
15. **Completa "Fábrica Compleja"** → +300 puntos

### Fase 5: Experto (Nivel Experto)
16. Investiga todas las tecnologías de experto
17. **Completa "Ingeniero Completo"** → +500 puntos
18. ¡Tu fábrica es completamente automatizada!

---

## 🔧 Características del Sistema

### Sistemas Implementados

- **Sistema de Extracción**: Los mineros extraen recursos del terreno
- **Sistema de Transporte**: Las cintas mueven recursos direccionalmente
- **Sistema de Almacenamiento**: Los almacenes guardan hasta 250 items
- **Sistema de Producción**: Las fundiciones procesan recursos en placas
- **Sistema de Investigación**: Árbol tech que desbloquea 8 investigaciones
- **Sistema de Misiones**: 5 objetivos que otorgan puntos de progreso
- **Sistema de Desbloqueo**: Edificios se desbloquean dinámicamente
- **Sistema de Cámara**: Zoom y pan para explorar el mundo
- **Sistema de Persistencia**: Guardado automático en localStorage

### Inventario de Salida

Los productos de cualquier producción siempre van al inventario denominado "salida" (`outputInventory`). Esto incluye:
- **Fundiciones**: Hierro y cobre procesados van a salida
- **Ensambladores**: Cable, bobinas y piezas de construcción van a salida

El inventario de salida permite un mejor control del flujo de recursos separándose del inventario de entrada.

### Sistema de Direcciones

El sistema de cintas transportadoras usa direcciones para controlar el flujo:
- **UP** (0): Sube (↑)
- **RIGHT** (1): Derecha (→)
- **DOWN** (2): Baja (↓)
- **LEFT** (3): Izquierda (←)

Los edificios solo aceptan entrada de cintas que apunten **HACIA** ellos y solo envían salida a cintas que apunten **DESDE** ellos.

### Generación Dinámica de Sprites

Los gráficos se generan en tiempo de ejecución usando Canvas:
- **Recursos**: Iconos personalizados
  - Hierro, Cobre: Cuadrados de color
  - Carbón: Cuadrado negro
  - Placas: Rectángulos de color claro
  - **Cable**: Líneas amarilla y roja curvas sobre fondo azul
- **Edificios**: Representación visual en iconos

## 📁 Estructura del Proyecto

```
.
├── index.html         # Entrada HTML principal (juego completo)
├── game.html          # Versión alternativa del juego
├── style.css          # Estilos de la aplicación
├── README.md          # Este archivo
└── .nojekyll          # Configuración para GitHub Pages
```

## 🔧 Tecnología

- **JavaScript Vanilla** - Sin frameworks ni librerías externas
- **Canvas 2D** - Para renderizado gráfico
- **LocalStorage** - Para persistencia de datos
- **GitHub Pages Ready** - Completamente estático

## 📦 Despliegue en GitHub Pages

1. **Crea un repositorio en GitHub**
2. **Sube los archivos:**
   ```bash
   git init
   git add .
   git commit -m "Factorio Web Game"
   git branch -M main
   git remote add origin https://github.com/tunombre/mi-repo.git
   git push -u origin main
   ```
3. **Ve a Settings → Pages**
4. **Selecciona "Deploy from a branch"**
5. **Elige `main` como rama y `/root` como carpeta**
6. **¡Listo!** Tu juego estará en: `https://tunombre.github.io/mi-repo/`

## 💾 Sistema de Guardado

El juego guarda automáticamente en `localStorage`:
- Posición de todos los edificios
- Inventario del jugador
- Tiempo de juego
- Presiona **S** para guardar manualmente

## ⚡ Características Destacadas

- ✅ Renderizado optimizado de tiles visibles
- ✅ Cache de sprites dinámicos
- ✅ Sistema de cámara con zoom
- ✅ Sin dependencias externas
- ✅ Completamente responsivo

## 🐛 Troubleshooting

### El juego no funciona
1. Abre DevTools (**F12**)
2. Revisa la consola para errores
3. Asegúrate de tener un navegador moderno (Chrome, Firefox, Edge)

### El guardado no funciona
- Los navegadores privados/incógnito no permiten localStorage
- Intenta en modo normal

## 📄 Licencia

MIT - Libre para usar y modificar

## 🚀 Hoja de Ruta Futura

- [ ] Múltiples capas de producción
- [ ] Sistema de investigación tecnológica
- [ ] Enemigos y defensa
- [ ] Más edificios especializados
- [ ] Música y sonido
- [ ] Campañas y misiones

---

**¡Disfruta automatizando tu fábrica!** 🏭✨
