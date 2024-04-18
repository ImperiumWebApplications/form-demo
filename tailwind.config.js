/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        teal: {
          600: "#127C95",
          700: "#0e6174",
        },
      },
    },
  },
  plugins: [],
};
