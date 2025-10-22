/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class", // <-- important for manual dark theme toggle
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // scan all React files
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
