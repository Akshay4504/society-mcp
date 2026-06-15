/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        darkBg: '#090a0f',
        cardBg: '#121420',
        glassBg: 'rgba(18, 20, 32, 0.7)',
        accentPurple: '#8B5CF6',
        accentIndigo: '#6366F1',
        accentCyan: '#06B6D4',
        accentEmerald: '#10B981',
        accentOrange: '#F59E0B',
        accentRose: '#F43F5E',
      },
      boxShadow: {
        glow: '0 0 15px rgba(139, 92, 246, 0.15)',
        cyanGlow: '0 0 15px rgba(6, 182, 212, 0.15)',
        emeraldGlow: '0 0 15px rgba(16, 185, 129, 0.15)',
        roseGlow: '0 0 15px rgba(244, 63, 94, 0.15)',
      }
    },
  },
  plugins: [],
}
