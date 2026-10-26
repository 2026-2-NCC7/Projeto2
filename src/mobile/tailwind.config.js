/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.jsx", "./src/**/*.{js,jsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        achai: "#F26900",
        ink: "#1F1F1F",
      },
      fontFamily: {
        sans: ["Inter"],
        brand: ["Rubik"],
      },
    },
  },
  plugins: [],
};
