/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./web/*.{html,js}", "./web/articles/*.{html,js}"],
  theme: {
    extend: {},
    fontFamily: {
      'sans': ['"IA Writer Quattro S"', 'ui-sans-serif', 'system-ui'],
      'display': ['"IA Writer Quattro S"', 'ui-sans-serif', 'system-ui'],
      'body': ['"IA Writer Quattro S"', 'ui-sans-serif', 'system-ui'],
    }
  },
  plugins: [],
}
