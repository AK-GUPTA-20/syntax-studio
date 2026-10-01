/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
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
        'glow-cyan': '0 0 25px rgba(95, 200, 200, 0.25)',
        'glow-amber': '0 0 25px rgba(232, 163, 61, 0.25)',
        'glow-cyan-lg': '0 0 50px rgba(95, 200, 200, 0.35)',
        'glow-amber-lg': '0 0 50px rgba(232, 163, 61, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
