// filesystem.js
export function getFileSystem() {
  return {
    "/": {
      type: "dir",
      security: 2,
      contents: {
        bin: {
          type: "dir",
          security: 1,
          contents: {
            "ls": { type: "exec", module: "./modules/ls_stub.js", security: 0 },
            "cat": { type: "exec", module: "./modules/cat_stub.js", security: 0 },
            "echo": { type: "exec", module: "./modules/echo_stub.js", security: 0 },
            "sh": { type: "exec", module: "./modules/sh_stub.js", security: 1 }
          }
        },
        sbin: {
          type: "dir",
          security: 2,
          contents: {
            "ifconfig": { type: "file", content: "ifconfig: utility not available in this environment", security: 2 }
          }
        },
        usr: {
          type: "dir",
          security: 1,
          contents: {
            bin: { type: "dir", security: 1, contents: {} },
            lib: { type: "dir", security: 1, contents: {} }
          }
        },
        etc: {
          type: "dir",
          security: 2,
          contents: {
            "passwd": { type: "file", content: "root:x:0:0:root:/root:/bin/sh\nguest:x:1000:1000:guest:/home/guest:/bin/sh", security: 2 },
            "hosts": { type: "file", content: "127.0.0.1 localhost\n::1 localhost", security: 1 },
            "fstab": { type: "file", content: "# /etc/fstab: static file system information", security: 2 },
            "motd": { type: "file", content: "Welcome to S.P.L.I.T. virtual system\nUnauthorized access prohibited.", security: 1 }
          }
        },
        var: {
          type: "dir",
          security: 1,
          contents: {
            log: {
              type: "dir",
              security: 1,
              contents: {
                "syslog": { type: "file", content: "[2025-10-06] system boot\n[2025-10-06] services started\n", security: 1 },
                "auth.log": { type: "file", content: "", security: 2 }
              }
            },
            tmp: { type: "dir", security: 0, contents: {} }
          }
        },
        proc: { type: "dir", security: 2, contents: {} },
        sys: { type: "dir", security: 2, contents: {} },
        dev: { type: "dir", security: 2, contents: {} },
        tmp: { type: "dir", security: 0, contents: {} },
        boot: {
          type: "dir",
          security: 2,
          contents: {
            "vmlinuz": { type: "file", content: "<kernel-binary-placeholder>", security: 2 },
            "initrd.img": { type: "file", content: "<initrd-placeholder>", security: 2 }
          }
        },
        lib: {
          type: "dir",
          security: 1,
          contents: {
            "modules": { type: "dir", security: 1, contents: {} }
          }
        },
        opt: { type: "dir", security: 1, contents: {} },
        mnt: { type: "dir", security: 0, contents: {} },
        media: { type: "dir", security: 0, contents: {} },

        // Home: aquí colocamos al usuario "guest" (o tu user) y la carpeta trabajo
        home: {
          type: "dir",
          security: 0,
          contents: {
            guest: {
              type: "dir",
              security: 0,
              contents: {
                "readme.txt": {
                  type: "file",
                  content: "Bienvenido a tu directorio personal.\nColoca aquí tus archivos.",
                  security: 0
                },
                trabajo: {
                  type: "dir",
                  security: 1,
                  contents: {
                    // aquí están los módulos de trabajo (ejecutables .ssh)
                    "admin_perks.ssh": {
                      type: "exec",
                      module: "./modules/admin_perks.ssh.js",
                      security: 1
                    },
                    "fazbear_intern_chat.ssh": {
                      type: "exec",
                      module: "./modules/fazbear_intern_chat.ssh.js",
                      security: 1
                    }
                  }
                }
              }
            },
            // Añadimos otro usuario ejemplo
            kronno: {
              type: "dir",
              security: 0,
              contents: {
                "notes.txt": { type: "file", content: "Notas de Kronno.", security: 0 }
              }
            }
          }
        },

        // Terminal folder (mantengo tu Terminal original para compatibilidad)
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
              module: "./modules/admin_perks.ssh.js",
              security: 0
            },
            "fazbear_intern_chat.ssh": {
              type: "exec",
              module: "./modules/fazbear_intern_chat.ssh.js",
              security: 0
            },
            "tic_tac_toe.ssh": {
              type: "exec",
              module: "./modules/tic_tac_toe.ssh.js",
              security: 0
            },
            "prueba.pdf": {
              type: "Tfile",
              secutiry: 0
            }
          }
        },

        // Root-level helper files
        "README.md": {
          type: "file",
          content: "# S.P.L.I.T. virtual filesystem\nThis is a simulated FS for the terminal module.",
          security: 0
        },
        "authorized_keys": {
          type: "file",
          content: "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
          security: 2
        }
      }
    }
  };
}
