// js/modules/admin_perks.js
export async function run(ctx) {
  const wait = ms => new Promise(r => setTimeout(r, ms));

  function p(text = '') { ctx.print(text); }

  p('Iniciando admin_perks...');
  await wait(200);

  let running = true;
  while (running) {
    p();
    p('================ADMIN PERKS - Menú================');
    p('1. Aplicar permisos de administrador al usuario');
    p('2. Documentación de la aplicación');
    p('3. IMPORTANTE: Para el IT.');
    p('4. Salir');
    p('===================================================');
    const choice = (await ctx.requestInput('Selecciona 1-4:')).trim();

    if (!choice) {
      p('No se ha introducido nada. Saliendo del módulo.');
      return;
    }

    if (choice === '1') {
      // pedir contraseña
      const pw = await ctx.requestInput('Introduce contraseña:');
      if (pw === null) { // por si requestInput resolviera null, opcional
        p('Entrada cancelada. Cerrando módulo.');
        return;
      }
      if (pw === 'Matrix') {
        p('');
        p('Contraseña correcta. Ampliando permisos...');
        await wait(400);
        ctx.increaseSecurity(1);
        p('Permisos ampliados. Odio a Fazbear Entertainment.');
        return; // finaliza módulo tras éxito
      } else {
        p('');
        p('Contraseña incorrecta. Cerrando programa.');
        return;
      }
    } else if (choice === '2') {
      p('');
      p('Documentación: no disponible. Solo la contraseña funcionará.');
      await wait(200);
      // volver al menú
      continue;
    } else if (choice === '3') {
      p('');
      p('Estoy harto: la verificación de admin es una mierda. Cualquiera con nivel bajo podría acceder.');
      await wait(300);
      continue;
    } else if (choice === '4') {
      p('');
      p('Saliendo del programa...');
      await wait(200);
      return;
    } else {
      p('');
      p('Opción no válida. Intenta 1,2,3 o 4.');
      await wait(150);
      continue;
    }
  }
}
