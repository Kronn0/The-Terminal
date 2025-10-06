// filesystem.js
export function getFileSystem(username) {

  username = username || 'guest'; // fallback  

  
  return {
    "/": {
      type: "dir",
      security: 0,
      contents: {
        // ===================================
        // Sistema (archivos del sistema)
        // ===================================
        Sys: {
          type: "dir",
          security: 1,
          contents: {
            bin: {
              type: "dir",
              security: 0,
              contents: {
                ls: { type: "exec", module: "./modules/ls_stub.js", security: 0 },
                cat: { type: "exec", module: "./modules/cat_stub.js", security: 0 },
                echo: { type: "exec", module: "./modules/echo_stub.js", security: 0 },
              }
            },
            etc: {
              type: "dir",
              security: 0,
              contents: {
                passwd: { type: "file", content: "root:x:0:0:root:/root:/bin/sh\nguest:x:1000:1000:guest:/home/guest:/bin/sh", security: 0 },
                motd: { type: "file", content: "Bienvenido a S.P.L.I.T. virtual system.", security: 0 }
              }
            },
            lib: { type: "dir", security: 0, contents: {} },
            tmp: { type: "dir", security: 0, contents: {} }
          }
        },

        // ===================================
        // Directorio de usuario
        // ===================================
        [username]: {
          type: "dir",
          security: 0,
          contents: {
            Documentos: { type: "dir", security: 0, contents: {
              "log_367.txt":{type: "file", security: 0, content: `[21/09/2025][Felix]: No puedo creer que todavía que no hayan arreglado el reseto de los permisos.\n[21/09/2025][${username}]: Lo sé, la verdad es que ya ni me sorprende.\n[21/09/2025][Felix]: Menos mal que tenemos la mierda que nos hizo Luis. Sí no estaría bastante cansado de estar poniendome los permisos uno a uno.` },
              "log_312.txt":{type: "file", security: 0, content: `[19/09/2025][Stan]: Ya no puedo hablar de Matrix sin estar pensando en el maldito trabajo.\n[19/09/2025][Mederik]: No te rayes mucho, va a ser temporal, eso creo. Tenía que ponerle algo para proteger al menos parte del sistema. Prefiero esto antes que 20 caracteres aleatorios; además ¿Por qué ibas a estar hablando todo el rato de la pelicula?}`}
            } },
            Imagenes: { type: "dir", security: 0, contents: {} },
            Descargas: { type: "dir", security: 0, contents: {} },
            Sonidos: { type: "dir", security: 0, contents: {} },
            Videos: { type: "dir", security: 0, contents: {} },
            Trabajo: {
              type: "dir",
              security: 0,
              contents: {
                "admin_perks.ssh": {
                  type: "exec",
                  module: "./modules/admin_perks.ssh.js",
                  security: 0
                },
                "fazbear_intern_chat.ssh": {
                  type: "exec",
                  module: "./modules/fazbear_intern_chat.ssh.js",
                  security: 1
                }
              }
            }
          }
        }
      }
    }
  };
}
