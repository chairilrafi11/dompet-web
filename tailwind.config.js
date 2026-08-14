/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          950: '#0c0f0e',
          900: '#111514',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.03)',
          card: 'rgba(255,255,255,0.045)',
        },
        line: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.14)',
        },
        fg: {
          primary: '#e7ebe9',
          secondary: '#9aa4a0',
          muted: '#6b7672',
        },
        brand: {
          DEFAULT: '#10b981',
          bright: '#34d399',
          dim: 'rgba(16,185,129,0.12)',
        },
        danger: '#f87171',
      },
      boxShadow: {
        card: '0 8px 24px -12px rgba(0,0,0,0.5)',
      },
      keyframes: {
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        fadeup: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite',
        fadeup: 'fadeup 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
