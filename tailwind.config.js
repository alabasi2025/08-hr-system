/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/web/src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Noto Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
