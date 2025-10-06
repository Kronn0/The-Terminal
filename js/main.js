import { initBootScreen } from './boot.js';
import { initTerminal } from './terminal.js';

window.addEventListener('DOMContentLoaded', () => {
  initBootScreen((username) => {
    // Cuando el usuario inicia sesión correctamente
    document.getElementById('boot-screen').remove();
    document.getElementById('terminal').style.display = 'block';
    initTerminal(username);
  });
});


// ============================
// globalKeys.js — sonido global de tecleo
// ============================
import { playType } from "./utils.js";

// Creamos el sonido base
const typeSound = new Audio("./assets/type.mp3");
typeSound.preload = "auto";

// Control para no saturar (máx. 15 sonidos/segundo)
let lastPlay = 0;
const SOUND_COOLDOWN = 60; // milisegundos

// Evento global para cualquier tecla
window.addEventListener("keydown", (e) => {
  // Ignora teclas de control o navegación
  if (
    e.ctrlKey ||
    e.altKey ||
    e.metaKey ||
    e.key.length !== 1 // solo letras, números, símbolos
  ) return;

  const now = Date.now();
  if (now - lastPlay < SOUND_COOLDOWN) return;
  lastPlay = now;

  playType(typeSound);
});
