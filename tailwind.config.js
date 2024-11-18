/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', 
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0)' },
          '50%': { transform: 'translateY(-5px) rotate(3deg)' }
        },
        'gradient-shift': {
          '0%, 100%': { transform: 'translateX(-50%)' },
          '50%': { transform: 'translateX(50%)' }
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '100%' },
          '100%': { backgroundPosition: '0%' }
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.1' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' }
        },
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'thinking-dots': {
          '0%, 20%': {
            content: '"."'
          },
          '40%': {
            content: '".."'
          },
          '60%, 100%': {
            content: '"..."'
          }
        }
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
        'text-shimmer': 'text-shimmer 2.5s ease-out infinite',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'fade-in-down': 'fade-in-down 0.3s ease-out',
        'thinking-dots': 'thinking-dots 1.5s infinite'
      }
    }
  },
  plugins: [],
}

