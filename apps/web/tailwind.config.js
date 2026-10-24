/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lighthouse brand palette — a deep ocean blue with warm amber accent.
        // These are intentional brand choices; do not replace with generic greys.
        lighthouse: {
          50:  '#f0f7ff',
          100: '#dbeafe',
          500: '#1d4ed8',
          600: '#1e40af',
          900: '#1e3a8a',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
