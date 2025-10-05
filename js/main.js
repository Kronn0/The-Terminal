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
