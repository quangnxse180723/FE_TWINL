module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f2fff6',
          100: '#dbffe8',
          200: '#b9ffd5',
          300: '#7dffb5',
          400: '#3eea8c',
          500: '#18c76d',
          600: '#0f8a4e',
          700: '#0b6b3e',
          800: '#0b5433',
          900: '#0a452c',
        },
      },
    },
  },
  plugins: [],
}
