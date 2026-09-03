import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "#000000",
        foreground: "#FFFFFF",
        surface: {
          DEFAULT: "#111111",
          elevated: "#1A1A1A",
          muted: "#222222",
        },
        primary: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#111111",
          foreground: "#FFFFFF",
        },
        accent: {
          cyan: "#00E8FF",
          orange: "#FF5C00",
          pink: "#FF09BB",
          green: "#22EF00",
          yellow: "#E4E800",
        },
        muted: {
          DEFAULT: "#222222",
          foreground: "#888888",
        },
      },
      fontFamily: {
        sigher: ["var(--font-sigher)", "cursive", "sans-serif"],
        display: ["var(--font-open-sauce)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        pill: "100px",
        card: "12px",
      },
      boxShadow: {
        brutalist: "4px 4px 0px 0px #FFFFFF",
        "brutalist-cyan": "4px 4px 0px 0px #00E8FF",
        "neon-cyan": "0px 0px 20px rgba(0, 232, 255, 0.35)",
        "neon-pink": "0px 0px 20px rgba(255, 9, 187, 0.35)",
        card: "0px 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
