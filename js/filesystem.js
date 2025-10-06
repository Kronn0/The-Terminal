export function getFileSystem() {
  return {
    "/": {
      type: "dir",
      security: 0,
      contents: {
        Terminal: {
          type: "dir",
          security: 0,
          contents: {
            "welcome.txt": {
              type: "file",
              content: "Bienvenido al sistema S.P.L.I.T.\nUsa 'help' para ver los comandos disponibles.",
              security: 0
            },
            "admin_perks.ssh": {
            type: "exec",
            module: "./modules/admin_perks.js",
            security: 0
            }
          }
        },
        home: {
          type: "dir",
          security: 0,
          contents: {
            "readme.txt": {
              type: "file",
              content: "Archivo de prueba.",
              security: 1
            },
            "tic_tac_toe.ssh":{
                type: "exec",
                module: "./module/tic_tac_toe.ssh",
                security: 0 
            }
          }
        }
      }
    }
  };
}
