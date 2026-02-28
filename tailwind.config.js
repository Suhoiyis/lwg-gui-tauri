/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1e1e2e", 
        surface: "rgba(30, 30, 46, 0.8)", 
        primary: "#89b4fa",    
        secondary: "#a6adc8",  
        danger: "#f38ba8",     
      }
    },
  },
  plugins: [],
}