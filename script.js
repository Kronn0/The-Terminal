/* ============================
   Terminal + Boot/Login logic
   ============================ */

const terminal = document.getElementById('terminal');
const bootScreen = document.getElementById('boot-screen');
const bootTextEl = document.getElementById('boot-text');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const typeSound = document.getElementById('type-sound');


let credentials = []; // cargadas desde assets/credentials.txt
let loggedIn = false;


/* -----------------------
   1) Texto de arranque y typing effect
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

function typeBootNext() {
  if (bootIndex >= bootLines.length) {
    // Mostrar form de login
    showLoginForm();
    return;
  }

  // Mostrar la línea actual y avanzar letra a letra
  const line = bootLines[bootIndex];
  if (charIndex <= line.length) {
    bootTextEl.textContent = bootLines.slice(0, bootIndex).join("\n") + (bootIndex ? "\n" : "") + line.slice(0, charIndex);
    charIndex++;
    setTimeout(typeBootNext, 28);
  } else {
    // pasar a la siguiente línea después de breve pausa
    bootIndex++;
    charIndex = 0;
    setTimeout(typeBootNext, 350);
  }
}

/* Inicia la secuencia al cargar la página */
document.addEventListener('DOMContentLoaded', () => {
  // arrancamos el "typing" del boot
  typeBootNext();
});

/* Si el usuario pulsa ENTER durante la pantalla de boot, mostramos formulario */
document.addEventListener('keydown', (ev) => {
  if (bootScreen && !loginForm.classList.contains('hidden') && ev.key === 'Enter') {
    // Nada: el formulario ya está visible
    return;
  }

  // Si el boot aún está tipeando y presionan Enter aceleramos al final
  if (!loginForm.classList.contains('hidden') && ev.key === 'Enter') {
    // se maneja en el form
    return;
  }

  // Si el boot aún está mostrando texto y el usuario aprieta Enter,
  // saltamos al final del boot y mostramos el formulario.
  if (!loginForm.classList.contains('hidden') === false && ev.key === 'Enter') {
    showLoginForm();
  }
});

/* -----------------------
   2) Mostrar / ocultar login
   ----------------------- */
function showLoginForm() {
  // Oculta la parte de texto typed y muestra el formulario centrado
  loginForm.classList.remove('hidden');
  usernameInput.focus();
}

/* -----------------------
   3) Cargar credenciales (archivo de texto)
   ----------------------- */
async function loadCredentials() {
  try {
    const resp = await fetch('assets/credentials.txt', { cache: "no-store" });
    if (!resp.ok) throw new Error('No se pudo cargar credentials.txt');
    const txt = await resp.text();
    // parse lines: cada linea "user/pass"
    credentials = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(line => {
      const [u, p] = line.split('/');
      return { user: u || '', pass: p || '' };
    });
  } catch (err) {
    loginError.classList.remove('hidden');
    loginError.textContent = 'Error cargando credenciales. Revisa assets/credentials.txt';
    console.error(err);
  }
}

/* Cargamos las credenciales antes de que el usuario intente loggear */
loadCredentials();

/* -----------------------
   4) Manejo del login
   ----------------------- */
loginForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  loginError.classList.add('hidden');

  const u = usernameInput.value.trim();
  const p = passwordInput.value;

  if (!u || !p) {
    showLoginError('Completa usuario y contraseña.');
    return;
  }

  // verificar contra las credenciales cargadas
  const ok = credentials.some(cred => cred.user === u && cred.pass === p);

  if (ok) {
    // LOGIN CORRECTO
    await enterSystem();
  } else {
    showLoginError('Usuario o contraseña incorrectos.');
    loginForm.classList.add('shake');
    setTimeout(() => loginForm.classList.remove('shake'), 350);
  }
});

function showLoginError(msg) {
  loginError.classList.remove('hidden');
  loginError.textContent = msg;
}

/* -----------------------
   5) Entrada al sistema: ocultar boot y activar terminal
   ----------------------- */
async function enterSystem() {
  bootTextEl.textContent = 'Verifying...';
  await new Promise(r => setTimeout(r, 700));

  // Guarda usuario actual
  currentUser = usernameInput.value.trim();

  // Oculta boot screen
  bootScreen.remove();

  // Muestra terminal y saludo
  document.getElementById('terminal').setAttribute('aria-hidden', 'false');
    print(`Welcome, ${currentUser}`);
    initTerminal();


}

/* -----------------------
   6) TERMINAL: sistema simulado
   ----------------------- */
let currentUser = "";        // ← usuario logueado
let currentPath = ["/", "home"]; // ← arranque en /Terminal
let currentLine = null;
let inputBuffer = "";

const fileSystem = {
  "/": {
    type: "dir",
    contents: {
      home: {
        type: "dir",
        contents: {
          "readme.txt": { type: "file", content: "Bienvenido al sistema S.P.L.I.T.\nNo todos los directorios son seguros..." },
          "notes.log": { type: "file", content: "Última conexión: 23:59 - ERROR: nodo corrupto" }
        }
      },
      system: {
        type: "dir",
        contents: {
          "config.sys": { type: "file", content: "[!] Configuración protegida.\nNo modificar." },
          "core.bin": { type: "file", content: "01001100 01001111 01010011 01010100" }
        }
      },
      secret: {
        type: "dir",
        contents: {
          "access.key": { type: "file", content: "Clave: ██-██-13-37\nNo compartas esto." }
        }
      }
    }
  }
};

function initTerminal() {
  // Crea primer prompt y activa escucha de teclas
  newPrompt();
  document.addEventListener('keydown', terminalKeyHandler);
}

/* -------------------------------------------------------------------
   KEYHANDLER de la terminal: escribe directamente sobre el último prompt
   ------------------------------------------------------------------- */
function terminalKeyHandler(e) {
  // si algún input del DOM tuviera foco (no debe tras login), ignoramos
  if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
    return;
  }

  e.preventDefault();
  const key = e.key;

  if (key.length === 1) {
    inputBuffer += key;
    updateCurrentLine();
    playType();
  } else if (key === 'Backspace') {
    inputBuffer = inputBuffer.slice(0, -1);
    updateCurrentLine();
  } else if (key === 'Enter') {
    executeCommand(inputBuffer.trim());
    inputBuffer = "";
    newPrompt();
  } else if (key === 'Tab') {
    e.preventDefault(); // evitar cambio de foco
  }
}

function updateCurrentLine() {
  if (!currentLine) return;
  // Reemplazamos únicamente el contenido del ultimo prompt (sin tocar líneas previas).
  currentLine.innerHTML = `${getPrompt()} ${escapeHtml(inputBuffer)}<span class="cursor"></span>`;
}

/* Crea un nuevo prompt; borra cursores anteriores
   para garantizar que sólo el último tenga el .cursor
*/
function newPrompt() {
  // eliminar cursores antiguos
  const oldCursors = terminal.querySelectorAll('.cursor');
  oldCursors.forEach(c => c.remove());

  const line = document.createElement('div');
  line.innerHTML = `${getPrompt()} <span class="cursor"></span>`;
  terminal.appendChild(line);
  currentLine = line;

  // mantener scroll abajo
  terminal.scrollTop = terminal.scrollHeight;
}

function getPrompt() {
  const dir = currentPath[currentPath.length - 1];
  return `${currentUser}@${dir} >`;
}

/* -----------------------
   Comandos: ls, cd, cat, help, echo, clear
   ----------------------- */
function executeCommand(cmd) {
  if (cmd === "") {
    // sólo nueva línea
    return;
  }

  const parts = cmd.split(/\s+/);
  const command = parts.shift().toLowerCase();
  const args = parts;

  switch (command) {
    case 'help':
      print(`Comandos: help, ls, cd, pwd, cat, echo, clear`);
      break;

    case 'ls':
      print(listDirectory());
      break;

    case 'pwd':
      print(getPrompt().replace(' >',''));
      break;

    case 'cd':
      changeDirectory(args[0]);
      break;

    case 'cat':
      readFile(args[0]);
      break;

    case 'echo':
      print(args.join(' '));
      break;

    case 'clear':
      terminal.innerHTML = '';
      inputBuffer = "";
      newPrompt();
      return;

    default:
      print(`Comando "${command}" no identificado`);
  }
}

/* ---- helpers de FS simulado ---- */
function listDirectory() {
  const dir = getDirectory(currentPath);
  if (!dir || !dir.contents) return 'No se puede listar este directorio.';
  return Object.keys(dir.contents).join('  ' + "\n");
}

function changeDirectory(name) {
  if (!name || name === '') {
    // sin args -> ir a /
    currentPath = ['/'];
    return;
  }
  if (name === '..') {
    if (currentPath.length > 1) currentPath.pop();
    return;
  }
  // Soportamos rutas relativas simples (no /absolute)
  const dir = getDirectory(currentPath);
  if (dir && dir.contents[name] && dir.contents[name].type === 'dir') {
    currentPath.push(name);
  } else {
    print(`cd: no existe el directorio "${name}"`);
  }
}

function readFile(name) {
  if (!name) {
    print('Uso: cat <archivo>');
    return;
  }
  const dir = getDirectory(currentPath);
  if (dir && dir.contents[name] && dir.contents[name].type === 'file') {
    print(dir.contents[name].content);
  } else {
    print(`cat: no se puede abrir "${name}"`);
  }
}

function getDirectory(pathArr) {
  let dir = fileSystem['/'];
  for (let i = 1; i < pathArr.length; i++) {
    const step = pathArr[i];
    if (dir.contents && dir.contents[step] && dir.contents[step].type === 'dir') {
      dir = dir.contents[step];
    } else {
      return null;
    }
  }
  return dir;
}

/* imprime una línea en la terminal */
function print(text) {
  const ln = document.createElement('div');
  ln.textContent = text;
  terminal.appendChild(ln);
  terminal.scrollTop = terminal.scrollHeight;
}

/* reproducir sonido tecleo (si existe) */
function playType() {
  try {
    typeSound.currentTime = 0;
    typeSound.play();
  } catch (err) { /* ignora */ }
}

/* helper simple para sanitizar input mostrado en DOM */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
