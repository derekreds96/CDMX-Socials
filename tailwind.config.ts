import type { Config } from "tailwindcss";

// Tokens de marca: azul CDMX Socials, dorado (CTA / La Noche Latina),
// magenta de alerta (Locals & Nomads) — mismos que usamos en el mockup de pantallas.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2A2BE0",
          soft: "#E3E3FB",
          ink: "#F7F7FF",
        },
        accent: {
          DEFAULT: "#F0A83A",
          ink: "#241503",
        },
        danger: {
          DEFAULT: "#E23D6B",
          soft: "#FBE1E9",
        },
        ink: {
          DEFAULT: "#14151F",
          soft: "#52566A",
          faint: "#8B8FA3",
        },
        line: "#DBDEEA",
      },
      fontFamily: {
        display: ["Anton", "Arial Narrow", "sans-serif"],
        script: ["Pacifico", "cursive"],
        body: ["Public Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
