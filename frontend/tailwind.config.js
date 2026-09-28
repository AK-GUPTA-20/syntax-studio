/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#0B0F14',
        surface: '#121821',
        surface2: '#1A2230',
        surface3: '#222C3D',
        border: '#26303F',
        text: '#E8EDF2',
        muted: '#8A97A8',
        amber: '#E8A33D',
        cyan: '#5FC8C8',
        green: '#6FCF97',
        purple: '#9B8EC4',
        red: '#EF6E6E',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(95, 200, 200, 0.25)',
        'glow-amber': '0 0 20px rgba(232, 163, 61, 0.25)',
      },
    },
  },
  plugins: [],
}
