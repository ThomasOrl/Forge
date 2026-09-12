/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#A855F7",
          hover: "#9333EA",
        },

        dark: {
          bg: "#080808",
          card: "#111111",
          cardAlt: "#161616",
          border: "#262626",
          text: "#F5F5F5",
          textSecondary: "#8A8A8A",
          hover: "#1A1324",
        },

        light: {
          bg: "#F7F7F5",
          card: "#FFFFFF",
          cardAlt: "#FAFAFA",
          border: "#E5E5E5",
          text: "#141414",
          textSecondary: "#6B6B6B",
          hover: "#F1E8F9",
        },
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        btn: "12px",
      },
      boxShadow: {
        light: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        cardHover: "0 4px 20px rgba(0,0,0,0.08)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.97)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.45s ease-out",
        scaleIn: "scaleIn 0.2s ease-out",
        slideUp: "slideUp 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
