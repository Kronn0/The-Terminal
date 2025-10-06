// terminal.js (versión limpia y moderna)
import { playType, delay } from './utils.js';
import { getFileSystem } from './filesystem.js';

let terminalEl, typeSound;
let currentUser = '';
let currentUserSecurity = 0;
let currentPath = ['/','Terminal'];
let fileSystem = null;

let inputBuffer = '';
let currentLine = null;

let moduleMode = false;            // true cuando un módulo pide input
let moduleInputResolve = null;     // resolver de la promesa de requestInput

let currentModulePrefix = null;   // nombre del módulo activo, p.ej. "admin_perks.ssh"
let currentPromptPrefix = null;   // prefijo usado por newPrompt / updateLine

let commandHistory = [];
let historyIndex = -1;


// =======================
// Inicializa terminal con usuario
// =======================
export function initTerminal(user) {
  terminalEl = document.getElementById('terminal');
  typeSound = document.getElementById('type-sound');
  if (!terminalEl) {
    console.error('terminalEl no encontrado');
    return;
  }
//hello world
  currentUser = user || 'guest';
  currentUserSecurity = 0;
  fileSystem = getFileSystem();

  print(`Welcome, ${currentUser}`);
  newPrompt();

  document.addEventListener('keydown', handleKey);
  window.newPrompt = newPrompt;
}

// =======================
// Key handler (async)
// =======================
async function handleKey(e) {
  if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
  e.preventDefault();

  const key = e.key;
  
  if (key === 'ArrowUp') {
  e.preventDefault();
  if (commandHistory.length === 0) return;

  if (historyIndex === -1) historyIndex = commandHistory.length - 1;
  else if (historyIndex > 0) historyIndex--;

  inputBuffer = commandHistory[historyIndex];
  updateLine();
  return;
}

if (key === 'ArrowDown') {
  e.preventDefault();
  if (commandHistory.length === 0) return;

  if (historyIndex !== -1) {
    historyIndex++;
    if (historyIndex >= commandHistory.length) {
      historyIndex = -1;
      inputBuffer = '';
    } else {
      inputBuffer = commandHistory[historyIndex];
    }
    updateLine();
  }
  return;
}

  if (key === 'Tab') {
    e.preventDefault();
    if (!moduleMode) handleAutocomplete();
    return;
  }

  if (key.length === 1) {
    inputBuffer += key;
    updateLine();
    playType(typeSound);
  } else if (key === 'Backspace') {
    inputBuffer = inputBuffer.slice(0, -1);
    updateLine();
  } else if (key === 'Enter') {
    if (moduleMode && moduleInputResolve) {
      const val = inputBuffer;
      inputBuffer = '';
      updateLine();
      const resolve = moduleInputResolve;
      moduleInputResolve = null;
      moduleMode = false;
      resolve(val);
    } else {
      if (inputBuffer.trim() !== '') {
  commandHistory.push(inputBuffer.trim());
  historyIndex = -1; // reset
}  
      await execute(inputBuffer.trim());
      inputBuffer = '';
      newPrompt();
    }
  }
}

// =======================
// Comandos / execute (async)
// =======================
async function execute(cmd) {
  if (!cmd) return;

  const parts = cmd.split(/\s+/);
  const command = parts.shift().toLowerCase();
  const args = parts;

  switch(command) {
    case 'help':
      print('Comandos: help, ls, cd, pwd, cat, echo, clear, execute');
      break;

    case 'clear':
      terminalEl.innerHTML = '';
      break;

    case 'echo':
      print(args.join(' '));
      break;

    case 'pwd':
      print(getPrompt().replace(' >',''));
      break;

    case 'ls': {
      const dir = getCurrentDir();
      const names = Object.keys(dir || {});
      print(names.join('  '));
      break;
    }

    case 'cd': {
      const target = args[0];
      if (!target || target === '/') { currentPath = ['/']; break; }
      if (target === '..') { if (currentPath.length > 1) currentPath.pop(); break; }

      const dir = getCurrentDir();
      const candidate = dir && dir[target];
      if (!candidate || candidate.type !== 'dir') {
        print(`cd: ${target}: No existe o no tienes permiso`);
      } else {
        currentPath.push(target);
      }
      break;
    }

    case 'cat': {
      const name = args[0];
      if (!name) { print('Uso: cat <archivo>'); break; }
      const dir = getCurrentDir();
      const file = dir && dir[name];
      if (!file) {
        print(`cat: ${name}: No existe o no tienes permiso`);
      } else if (file.type !== 'file') {
        print(`cat: ${name}: no es un archivo`);
      } else {
        print(file.content);
      }
      break;
    }

    case 'execute':
      if (args.length === 0) { print('Uso: execute <modulo>'); break; }
      await runModule(args[0]);
      break;

    default:
      print(`Comando "${command}" no reconocido.`);
  }
}

// =======================
// Autocomplete (Tab) para comandos + archivos/directorios
// =======================
function handleAutocomplete() {
  const parts = inputBuffer.split(' ');
  const last = parts.pop() || '';
  let suggestions = [];

  if (parts.length === 0) {
    // primera palabra → comando
    const commands = ['help','ls','cd','pwd','cat','echo','clear','execute'];
    suggestions = commands.filter(c => c.startsWith(last));
  } else {
    // no primera palabra → archivos/directorios actuales
    const dir = getCurrentDir();
    const files = Object.keys(dir || {});
    suggestions = files.filter(f => f.startsWith(last));
  }

  if (suggestions.length === 1) {
    parts.push(suggestions[0]);
    inputBuffer = parts.join(' ') + ' ';
    updateLine();
  } else if (suggestions.length > 1) {
    print(suggestions.join('    '));
    newPrompt();
    inputBuffer = parts.concat(last).join(' ');
    updateLine();
  }
}

// =======================
// Ejecutables / módulos
// =======================
async function runModule(name) {
  // Exigir .ssh (según tu petición)
  if (!name.endsWith('.ssh')) {
    print(`Error: Los módulos ejecutables deben tener extensión ".ssh"`);
    return;
  }

  const modPath = `./modules/${name}.js`;

  // Ponemos el prefijo del módulo — se usará cuando el módulo llame a requestInput()
  currentModulePrefix = name; // p.ej. "admin_perks.ssh"

  try {
    print(`Ejecutando ${name}...`);

    const mod = await import(modPath);
    if (!mod.run) {
      print(`${name}: módulo no expone run(ctx)`);
      currentModulePrefix = null;
      return;
    }

    const ctx = {
      print,
      getCurrentDirSafe: () => getCurrentDir(),
      currentPath: () => currentPath.slice(),
      user: currentUser,
      userSecurity: () => currentUserSecurity,
      increaseSecurity: (n = 1) => { currentUserSecurity += n; },
      requestInput,
      delay
    };

    // Ejecuta el módulo: sus ctx.print() aparecerán arriba del prompt;
    // cuando quiera leer algo llamará a await ctx.requestInput(...)
    await mod.run(ctx);

    print(`[${name} finalizado]`);
  } catch (err) {
    console.error(err);
    print(`${name}: error al ejecutar módulo`);
  } finally {
    // limpiamos prefijo del módulo para volver al prompt normal
    currentModulePrefix = null;
  }
}




// =======================
// Filesystem navigation
// =======================
function getCurrentDir() {
  if (!fileSystem) return {};
  let dir = fileSystem['/'];
  for (let i=1;i<currentPath.length;i++) {
    const name = currentPath[i];
    if (!dir.contents || !dir.contents[name] || dir.contents[name].type !== 'dir') return {};
    dir = dir.contents[name];
  }

  const result = {};
  if (!dir.contents) return result;
  for (const [k,v] of Object.entries(dir.contents)) {
    const sec = v.security || 0;
    if (sec <= currentUserSecurity) result[k] = v;
  }
  return result;
}

// =======================
// UI / prompt helpers
// =======================
function updateLine() {
  if (!currentLine) return;
  const promptText = currentPromptPrefix ? `${currentPromptPrefix} >` : getPrompt();
  currentLine.innerHTML = `${escapeHtml(promptText)} ${escapeHtml(inputBuffer)}<span class="cursor"></span>`;
}

function newPrompt(prefix = null) {
  // actualizamos el prefijo global del prompt actual
  currentPromptPrefix = prefix || null;

  const oldCursors = terminalEl.querySelectorAll('.cursor');
  oldCursors.forEach(c => c.remove());

  const line = document.createElement('div');

  // Si hay prefijo (p.ej. módulo), lo usamos; si no, usamos getPrompt()
  const promptText = currentPromptPrefix ? `${currentPromptPrefix} >` : getPrompt();

  line.textContent = promptText + ' ';
  terminalEl.appendChild(line);
  currentLine = line;

  const cursor = document.createElement('span');
  cursor.classList.add('cursor');
  line.appendChild(cursor);

  terminalEl.scrollTop = terminalEl.scrollHeight;
}





function getPrompt() {
  const dir = currentPath.length <= 1 ? '/' : currentPath[currentPath.length-1];
  return `${currentUser}@${dir} >`;
}

export function print(text) {
  if (!terminalEl) return;
  const ln = document.createElement('div');
  ln.textContent = text;
  terminalEl.appendChild(ln);
  terminalEl.scrollTop = terminalEl.scrollHeight;
}

function escapeHtml(s) {
  return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// =======================
// Solicitar input a módulos (promise)
// =======================
function requestInput(promptText = '') {
  return new Promise((resolve) => {
    moduleMode = true;
    moduleInputResolve = (val) => {
      // cuando se resuelva, devolvemos valor al módulo
      resolve(val);
    };

    // Si hay texto informativo, lo imprimimos (aparece encima del prompt)
    if (promptText) {
      const info = document.createElement('div');
      info.textContent = promptText;
      terminalEl.appendChild(info);
    }

    // Creamos (o recreamos) el prompt del módulo en la parte baja
    // Usamos currentModulePrefix si existe (debería establecerlo runModule)
    newPrompt(currentModulePrefix || null);

    inputBuffer = '';
    updateLine();
  });
}


