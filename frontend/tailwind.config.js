/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1117",
        surface: "#1a1f2e",
        "surface-2": "#242938",
        border: "#2d3548",
        "spill-red": "#ef4444",
        "no-spill-green": "#10b981",
        "uncertain-amber": "#f59e0b",
        accent: "#6366f1",
        "accent-hover": "#818cf8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "fade-in-slow": "fade-in 0.7s ease-out both",
        "pulse-ring": "pulse-ring 1.5s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite linear",
      },
    },
  },
  plugins: [],
}
