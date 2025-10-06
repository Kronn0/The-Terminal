// modules/system.js
import { delay } from "../utils.js";

let systemInitialized = false;
let lastSecurityLevel = 0;

export async function runSystem(ctx) {
  const { print, userSecurity } = ctx;

  // Primera vez que el sistema se inicia
  if (!systemInitialized) {
    systemInitialized = true;
    printSystem(ctx, "Te faltan permisos de Administrador, por favor comuníquese con servicio técnico para solucionar el problema.");
    lastSecurityLevel = userSecurity();
    return;
  }

  // Si el nivel de seguridad cambió
  const currentLevel = userSecurity();

  

  if (currentLevel > lastSecurityLevel) {
    // Detectamos subida de nivel
    await handleSecurityChange(ctx, currentLevel);
    lastSecurityLevel = currentLevel;
  }
}

// ======================================
// Mensajes y comportamiento del sistema
// ======================================

async function handleSecurityChange(ctx, level) {
  switch (level) {
    case 1:
      await delay(1500);
      printSystem(ctx, "Se le ha convocado en la sala 109 del chat interno de Fazbear. Por favor conéctese con urgencia.");
      break;
    case 2:
      await delay(1500);
      printSystem(ctx, "Nivel de acceso 2 confirmado. Desbloqueando nuevos módulos del sistema...");
      break;
    default:
      await delay(1000);
      printSystem(ctx, `Cambio de nivel detectado: ${level}`);
      break;
  }
}

// ======================================
// Helper para imprimir con formato [System]
// ======================================
export function printSystem(ctx, message) {
  const term = document.getElementById("terminal");
  if (!term) return;

  const line = document.createElement("div");
  line.innerHTML = `<span style="color: #ffcc00; font-weight: bold;">[System]: ${message}</span>`;
  term.appendChild(line);
  term.scrollTop = term.scrollHeight;
}