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
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        "inter-medium": ["Inter-Medium", "Inter", "sans-serif"],
        "inter-semibold": ["Inter-SemiBold", "Inter", "sans-serif"],
        "inter-bold": ["Inter-Bold", "Inter", "sans-serif"],
        "inter-extrabold": ["Inter-ExtraBold", "Inter", "sans-serif"],
        brand: ["Rubik-Bold", "Rubik", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
