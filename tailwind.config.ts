import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0f1113",
          900: "#15181b",
          800: "#1e2226",
          700: "#2a2f34",
          600: "#3a4046",
          500: "#5a6169",
          400: "#7c848c",
          300: "#a3aab1",
          200: "#c9cdd2",
          100: "#e6e8ea",
          50: "#f4f2ee",
        },
        paper: {
          DEFAULT: "#faf8f4",
          dim: "#f1ede5",
        },
        accent: {
          DEFAULT: "#1f3a5f",
          light: "#8fb4dd",
          dark: "#152a45",
        },
        signal: {
          good: "#2f6b4f",
          warn: "#a15c1f",
          bad: "#a13b3b",
        },
      },
      fontFamily: {
        serif: [
          "Iowan Old Style",
          "Palatino Linotype",
          "URW Palladio L",
          "P052",
          "Book Antiqua",
          "Georgia",
          "serif",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      maxWidth: {
        prose: "72ch",
      },
    },
  },
  plugins: [],
};

export default config;
