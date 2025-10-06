export const dialogues = {
  intro: {
    node_1: {
      id: "node_1",          // IMPORTANTE: debe tener un id
      speaker: "iris",
      text: "Hola, bienvenido al chat.",
      next: "node_2",
      securityLevel: 0
    },
    node_2: {
      id: "node_2",
      speaker: "user",
      choices: [
        { text: "Hola", next: "node_3" },
        { text: "Adiós", next: "node_4" }
      ],
      securityLevel: 0
    },
    node_3: {
      id: "node_3",
      speaker: "iris",
      text: "Genial, has avanzado al siguiente nivel.",
      next: null,
      securityLevel: 1
    },
    node_4: {
      id: "node_4",
      speaker: "iris",
      text: "Hasta luego.",
      next: null,
      securityLevel: 0
    }
  }
};
