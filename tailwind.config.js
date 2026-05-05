/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1117',
          1: '#161b27',
          2: '#1e2433',
          3: '#252d3d',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        border: '#2a3347',
      },
    },
  },
  plugins: [],
};
