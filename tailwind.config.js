/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
    },
    extend: {
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },
      fontFamily: {
        display: [
          "ui-rounded",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Noto Sans SC",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(16, 185, 129, 0.25)",
        card: "0 8px 24px -8px rgba(0, 0, 0, 0.08)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.4s ease-out both",
        pop: "pop 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};
