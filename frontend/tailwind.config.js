
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        slate: {
          950: '#020617',
        },
      },
      animation: {
        'slideIn': 'slideIn 0.3s ease-out',
        'fadeIn': 'fadeIn 0.4s ease-out',
      },
    },
  },
  plugins: [],
}
