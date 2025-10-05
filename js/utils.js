export const delay = (ms) => new Promise(res => setTimeout(res, ms));

export async function printCentered(container, text, speed = 30) {
  const line = document.createElement('div');
  line.style.margin = '5px 0';
  container.appendChild(line);
  for (const char of text) {
    line.textContent += char;
    await delay(speed);
  }
}

export function playType(audioEl) {
  try {
    audioEl.currentTime = 0;
    audioEl.play();
  } catch {}
}
