// ============================
// utils.js — versión extendida con random pitch
// ============================

export const delay = (ms) => new Promise(res => setTimeout(res, ms));

// ============================
// Texto centrado animado
// ============================
export async function printCentered(container, text, speed = 30) {
  const line = document.createElement('div');
  line.style.margin = '5px 0';
  line.style.textAlign = 'center';
  container.appendChild(line);
  for (const char of text) {
    line.textContent += char;
    await delay(speed);
  }
}

// ============================
// Sonido de tecleo con variación
// ============================
export function playType(audioElement) {
  if (!audioElement) return;

  // Clonamos el sonido para que varios puedan sonar a la vez
  const clone = audioElement.cloneNode(true);

  // Variación de pitch (velocidad)
  clone.playbackRate = 0.9 + Math.random() * 0.2; // entre 0.9x y 1.1x

  // Variación de volumen leve
  clone.volume = Math.min(1, 0.1 + Math.random() * 0.3); // entre 0.7 y 1

  // Pequeño retardo aleatorio (simula variación humana)
  const jitter = Math.random() * 25; // 0–25ms
  setTimeout(() => {
    clone.play().catch(() => {});
  }, jitter);
}
