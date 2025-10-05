/* -----------------------
   boot.js - Pantalla de inicio y login
   ----------------------- */
import { delay, playType } from './utils.js';
import { initTerminal, print } from './terminal.js';

let bootTextEl, bootScreen, loginForm, usernameInput, passwordInput, loginError;
let credentials = [];
let currentUser = '';
let currentUserSecurity = 0;

export function initBootScreen(onLoginSuccess) {
  // Referencias al DOM
  bootScreen = document.getElementById('boot-screen');
  bootTextEl = document.getElementById('boot-text');
  loginForm = document.getElementById('login-form');
  usernameInput = document.getElementById('username');
  passwordInput = document.getElementById('password');
  loginError = document.getElementById('login-error');

  // Inicia carga de credenciales
  loadCredentials();

  // Arranca typing del boot
  typeBootNext(onLoginSuccess);

  // Evento submit del formulario
  loginForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    loginError.classList.add('hidden');

    const u = usernameInput.value.trim();
    const p = passwordInput.value;

    if (!u || !p) {
      showLoginError('Completa usuario y contraseña.');
      return;
    }

    // Verificar contra las credenciales cargadas
    const ok = credentials.some(cred => cred.user === u && cred.pass === p);

    if (ok) {
      currentUser = u;
      await enterSystem(onLoginSuccess);
    } else {
      showLoginError('Usuario o contraseña incorrectos.');
      loginForm.classList.add('shake');
      setTimeout(() => loginForm.classList.remove('shake'), 350);
    }
  });
}

/* -----------------------
   Texto de arranque y typing effect
   ----------------------- */
const bootLines = [
  "Welcome to the Fazbear ███████ Project.",
  "",
  "Please refrain to enter if you has not clearance to enter.",
  "",
  "Press ENTER to continue..."
];

let bootIndex = 0;
let charIndex = 0;

function typeBootNext(onLoginSuccess) {
  if (bootIndex >= bootLines.length) {
    // Mostrar form de login
    showLoginForm();
    return;
  }

  const line = bootLines[bootIndex];

  if (charIndex <= line.length) {
    bootTextEl.textContent = bootLines.slice(0, bootIndex).join("\n") +
      (bootIndex ? "\n" : "") + line.slice(0, charIndex);
    charIndex++;
    setTimeout(() => typeBootNext(onLoginSuccess), 28);
  } else {
    bootIndex++;
    charIndex = 0;
    setTimeout(() => typeBootNext(onLoginSuccess), 350);
  }
}

/* -----------------------
   Mostrar / ocultar login
   ----------------------- */
function showLoginForm() {
  loginForm.classList.remove('hidden');
  usernameInput.focus();
}

/* -----------------------
   Cargar credenciales
   ----------------------- */
async function loadCredentials() {
  try {
    const resp = await fetch('assets/credentials.txt', { cache: "no-store" });
    if (!resp.ok) throw new Error('No se pudo cargar credentials.txt');
    const txt = await resp.text();

    credentials = txt.split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        const [u, p] = line.split('/');
        return { user: u || '', pass: p || '' };
      });
  } catch (err) {
    loginError.classList.remove('hidden');
    loginError.textContent = 'Error cargando credenciales. Revisa assets/credentials.txt';
    console.error(err);
  }
}

/* -----------------------
   Mostrar mensaje de error
   ----------------------- */
function showLoginError(msg) {
  loginError.classList.remove('hidden');
  loginError.textContent = msg;
}

/* -----------------------
   Entrada al sistema
   ----------------------- */
async function enterSystem(onLoginSuccess) {
  bootTextEl.textContent = 'Verifying...';
  await delay(700);

  // Oculta boot screen
  bootScreen.remove();

  // Muestra terminal
  const terminalEl = document.getElementById('terminal');
  terminalEl.setAttribute('aria-hidden', 'false');



  // Saludo al usuario
  print(`Welcome, ${currentUser}`);

  // Inicializa terminal con usuario
  initTerminal(currentUser);

  // Callback si quieres ejecutar algo más
  if (onLoginSuccess) onLoginSuccess(currentUser);
}

export { currentUser };
