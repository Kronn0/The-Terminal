import { dialogues } from "../data/fazbear_dialogues.js";

export async function run(ctx) {
  // === Helpers para imprimir con color ===
  function printMessage(text, type = "system") {
    const div = document.createElement("div");
    if(type === "iris") div.classList.add("message-iris");
    else if(type === "system") div.classList.add("message-system");
    else div.classList.add("message-user");
    div.textContent = text;
    ctx.terminalEl.appendChild(div);
    ctx.terminalEl.scrollTop = ctx.terminalEl.scrollHeight;
  }

  // Bloquear input al inicio
  if (window.disableTerminalInput) window.disableTerminalInput();
  ctx.terminalEl = document.getElementById("terminal");

  // Simula que Iris está escribiendo
  async function irisTyping(text) {
    const typingLine = document.createElement("div");
    typingLine.classList.add("message-iris");
    typingLine.textContent = "[Iris is typing...]";
    ctx.terminalEl.appendChild(typingLine);
    ctx.terminalEl.scrollTop = ctx.terminalEl.scrollHeight;

    // Tiempo proporcional a longitud del mensaje (acotado)
    const duration = Math.min(Math.max(text.length * 50, 500), 2000) + Math.random() * 300;
    await ctx.delay(duration);

    typingLine.remove();
    printMessage(`[Iris]: ${text}`, "iris");
  }

  // Simula escritura del usuario letra a letra
  async function simulateUserTyping(choiceText) {
    return new Promise((resolve) => {
      let typed = "";
      let index = 0;

      const onKey = (e) => {
        e.preventDefault();
        if (index < choiceText.length) {
          typed += choiceText[index];
          index++;
          const lines = ctx.terminalEl.querySelectorAll("div");
          const last = lines[lines.length - 1];
          last.textContent = `[${ctx.user}]: ${typed}`;
        }

        if (index >= choiceText.length && e.key === "Enter") {
          document.removeEventListener("keydown", onKey);
          resolve();
        }
      };

      const line = document.createElement("div");
      line.classList.add("message-user");
      line.textContent = `[${ctx.user}]: `;
      ctx.terminalEl.appendChild(line);
      ctx.terminalEl.scrollTop = ctx.terminalEl.scrollHeight;

      document.addEventListener("keydown", onKey);
    });
  }

  // Mostrar opciones y devolver la siguiente acción
  async function presentChoices(choices) {
    const choiceElements = [];
    choices.forEach((c, i) => {
      const line = document.createElement("div");
      line.classList.add("message-user");
      line.textContent = `${i + 1}) ${c.text}`;
      ctx.terminalEl.appendChild(line);
      choiceElements.push(line);
    });

    return new Promise((resolve) => {
      const onChoice = async (e) => {
        if (["1","2","3","4","5","6","7","8","9"].includes(e.key)) {
          const index = parseInt(e.key) - 1;
          if (index >= 0 && index < choices.length) {
            document.removeEventListener("keydown", onChoice);
            choiceElements.forEach(el => el.remove());
            const choice = choices[index];
            await simulateUserTyping(choice.text);
            resolve(choice.next);
          }
        }
      };
      document.addEventListener("keydown", onChoice);
    });
  }

  // Ejecutar nodo según flujo y nivel de seguridad
  async function runNode(nodeId) {
    const node = dialogues.intro[nodeId];
    if (!node) return null;

    const level = node.securityLevel ?? 0;
    const executed = node.executed ?? false;

    if (level > ctx.userSecurity() || executed) return null;

    node.executed = true;

    if (node.speaker.toLowerCase() === "iris") {
      await irisTyping(node.text);
      if (node.next) return runNode(node.next);
      else return null;
    } else if (node.speaker.toLowerCase() === "user") {
      const next = await presentChoices(node.choices);
      if (next) return runNode(next);
      else return null;
    }
  }

  // ===== INICIO DEL CHAT =====
  const availableNodes = Object.values(dialogues.intro).filter(n => {
    const level = n.securityLevel ?? 0;
    const executed = n.executed ?? false;
    return !executed && level <= ctx.userSecurity();
  });

  if (availableNodes.length === 0) {
    printMessage("[System]: Conectando con el servidor interno...", "system");
    await ctx.delay(1500);
    printMessage("[System]: Verificando...", "system");
    await ctx.delay(1500);
    printMessage("[System]: Error, sala 109 esta offline.", "system");
    printMessage("[System]: Cerrando chat.", "system");
    if (window.enableTerminalInput) window.enableTerminalInput();
    return;
  }

  printMessage("[System]: Conectando con el servidor interno...", "system");
  await ctx.delay(2000);
  printMessage("[System]: Verificando...", "system");
  await ctx.delay(2000);
  printMessage(`[System]: Conectado al chat de texto número 109 - Usuarios conectados: ${ctx.user}, Iris`, "system");
  await ctx.delay(1000);

  // Ejecutar todos los nodos disponibles del nivel actual
  for (const node of availableNodes) {
    await runNode(node.id);
  }

  // Finaliza chat
  printMessage("", "system");
  printMessage("[System]: Iris ha salido del chat", "system");
  printMessage("[System]: La sala 109 ha sido desconectada.", "system");
  printMessage("[System]: Cerrando chat.", "system");

  if (window.enableTerminalInput) window.enableTerminalInput();
}
