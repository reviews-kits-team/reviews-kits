/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#0A0A0F',
          bg2: '#111118',
          bg3: '#16161F',
          teal: '#0D9E75',
          'teal-dim': 'rgba(13, 158, 117, 0.12)',
          'teal-glow': 'rgba(13, 158, 117, 0.25)',
          border: 'rgba(255, 255, 255, 0.07)',
          border2: 'rgba(255, 255, 255, 0.12)',
          text: '#F2F0EB',
          muted: '#6E6C7A',
          muted2: '#9896A4',
          red: '#E05454',
          'red-dim': 'rgba(224, 84, 84, 0.1)',
          yellow: '#F4B730',
        },
        avatar: {
          'teal-from': '#0D9E75',
          'teal-to': '#0a6e52',
          'purple-from': '#7c3aed',
          'purple-to': '#4f46e5',
          'amber-from': '#f59e0b',
          'amber-to': '#d97706',
        },
        code: {
          bg: '#0D0D14',
        },
        cta: {
          from: '#0a1f18',
          via: '#091510',
          to: '#060B09',
        }
      }
    },
  },
  plugins: [],
}
