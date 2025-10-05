// js/modules/ssh_probe.js
export async function run(ctx) {
  ctx.print("Iniciando probe.ssh...");
  // pequeña espera visual
  await new Promise(r => setTimeout(r, 600));

  // desafío: escribir exactamente esta cadena en 8 segundos
  const target = "connect 192.168.0.13 -auth";
  ctx.print(`Challenge: reproduce la línea en 8s`);
  const ok = await ctx.showOverlay ? ctx.showOverlay({
    targetText: target,
    timeLimit: 8000,
  }) : (await fallbackTypingChallenge(target, 8000));

  if (ok) {
    ctx.print("Probe completado. Nivel de seguridad aumentado.");
    ctx.increaseSecurity(1); // sube nivel de seguridad del usuario
  } else {
    ctx.print("Probe fallido. No se ha aumentado la seguridad.");
  }
}
