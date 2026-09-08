/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f1115",
        surface: "#ffffff",
        muted: "#6b7280",
        accent: "#c8102e",
        gold: "#b8860b",
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
        display: ["'Playfair Display'", "serif"],
      },
      boxShadow: {
        card: "0 2px 12px rgba(15,17,21,0.06)",
        cardHover: "0 12px 32px rgba(15,17,21,0.12)",
      },
    },
  },
  plugins: [],
};
