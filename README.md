# 🏭 Factorio Web - Juego de Automatización

Una implementación web completa de un juego de automatización tipo Factorio, construido con **vanilla JavaScript** sin dependencias externas.

## 🎮 Estado Actual

**VERSIÓN: 1.0 - LISTO PARA GITHUB PAGES**

El juego es totalmente funcional con todos los sistemas core implementados:
- ✅ Sistema de extracción de recursos (minería)
- ✅ Sistema de transporte (cintas direccionales)
- ✅ Sistema de almacenamiento (almacenes de 250 items)
- ✅ Sistema de procesamiento (fundiciones con inventarios de salida)
- ✅ Interfaz de usuario completa
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

- **M** - Seleccionar modo Minero
- **C** - Seleccionar modo Cinta
- **A** - Seleccionar modo Almacén
- **F** - Seleccionar modo Fundición
- **E** - Seleccionar modo Ensamblador
- **Click Izquierdo** - Colocar edificio
- **Rueda del Ratón** - Zoom
- **Click Derecho + Arrastrar** - Mover cámara
- **Rueda Central** - Eliminar edificio
- **R** - Rotar cinta (cuando está seleccionada)
- **Espacio** - Pausa/Reanuda
- **S** - Guardar partida

## 🏭 Edificios

### Minero ⛏️
- **Función:** Extrae recursos del terreno
- **Producción:** 2 items/tick
- **Capacidad:** 25 items
- **Entrada:** Nodos de recurso en el terreno
- **Salida:** Cinta o almacén adyacente

### Cinta Transportadora 🚚
- **Función:** Transporta recursos hacia direcciones específicas
- **Velocidad:** 1 item/tile/tick
- **Capacidad:** Ilimitada (es un transporte)
- **Entrada:** Minero u otro edificio
- **Salida:** Siguiente cinta o destino
- **Rotación:** R para rotar (0°, 90°, 180°, 270°)

### Almacén 📦
- **Función:** Almacena recursos sin límite
- **Capacidad:** 250 items
- **Entrada:** Cinta u otro edificio (debe apuntar hacia el almacén)
- **Salida:** Transfiere a cintas adyacentes (solo si la cinta apunta DESDE el almacén)

### Fundición 🔥
- **Función:** Procesa minerales en placas
- **Recetas:**
  - Hierro + Carbón → Placa de Hierro (30 ticks)
  - Cobre + Carbón → Placa de Cobre (30 ticks)
- **Inventario de Entrada:** Para minerales y combustible
- **Inventario de Salida:** Para productos procesados
- **Capacidad:** 20 items entrada, 20 items salida

## 🎯 Cómo Jugar

1. **Coloca un minero (M)** sobre un nodo de recurso (mostrado en el mapa)
2. **El minero extrae automáticamente** recursos
3. **Coloca cintas (C)** para transportar recursos entre edificios
4. **Crea un almacén (A)** para guardar producción
5. **Construye una fundición (F)** para convertir minerales en placas
6. **Expande tu fábrica** conectando más edificios

## 🔧 Características del Sistema

### Sistemas Implementados

- **Sistema de Extracción**: Los mineros extraen recursos del terreno
- **Sistema de Transporte**: Las cintas mueven recursos direccionalmente
- **Sistema de Almacenamiento**: Los almacenes guardan hasta 250 items
- **Sistema de Producción**: Las fundiciones procesan recursos en placas
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
