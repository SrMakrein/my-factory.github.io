/**
 * Sistema de Consola y Logging
 * Gestiona el registro de eventos y mensajes del juego
 */

class ConsoleLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 150;
    this.setupUI();
    this.tickCounter = 0;
  }

  setupUI() {
    const consoleButton = document.getElementById('consoleButton');
    if (consoleButton) {
      consoleButton.addEventListener('click', () => {
        const panel = document.getElementById('consolePanel');
        if (panel) {
          panel.classList.toggle('open');
        }
      });
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    this.logs.push({ message: logEntry, type });

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.updateUI();
    // También imprimir en consola del navegador para debugging
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  info(message) { this.log(message, 'info'); }
  error(message) { this.log(message, 'error'); }
  warn(message) { this.log(message, 'warn'); }
  debug(message) { this.log(message, 'debug'); }

  updateUI() {
    const output = document.getElementById('consoleOutput');
    if (!output) return;
    output.innerHTML = this.logs
      .map(log => `<div class="log-${log.type}">${log.message}</div>`)
      .join('');
    output.scrollTop = output.scrollHeight;
  }

  tick() {
    this.tickCounter++;
    if (this.tickCounter % 10 === 0) {
      this.debug(`Tick #${this.tickCounter}`);
    }
  }
}

// Crear instancia global del logger
const logger = new ConsoleLogger();
logger.info('🟢 Sistema iniciado');
