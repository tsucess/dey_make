/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: { extend: {
    fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
     colors: {
        slate100: "#1A1A1A",
        orange100 : "#FDB300",
        slate200: "#D9D9D9",
        slate300: "#595959",
        
      }, 
  } },
  plugins: [],
}