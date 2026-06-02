/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0a1628",
        navy2: "#0d1b2a",
        navy3: "#102036",
        gold: "#c8a84e",
        "gold-light": "#f0d078",
        "gold-dark": "#9c7c2e",
      },
      fontFamily: {
        ar: ["Tajawal", "Cairo", "sans-serif"],
        en: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};
