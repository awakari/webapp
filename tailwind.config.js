/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./web/*.{html,js}", "./web/articles/*.{html,js}"],
  theme: {
    extend: {},
    fontFamily: {
      'sans': ['"iA Writer Quattro S"', 'ui-sans-serif', 'system-ui'],
      'display': ['"iA Writer Quattro S"', 'ui-sans-serif', 'system-ui'],
      'body': ['"iA Writer Quattro S"', 'ui-sans-serif', 'system-ui'],
    }
  },
  plugins: [],
}
