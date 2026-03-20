/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f1219',
        panel: '#1a2030',
        'panel-dark': '#141820',
        border: '#3a4258',
        'border-dim': '#252d3d',
        gold: '#c9a84c',
        'gold-dim': '#8a6d2a',
        alert: '#c44536',
        'alert-dim': '#7a2a20',
        success: '#4a8c6f',
        'success-dim': '#2a5040',
        blue: '#4a7ab8',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'Courier New', 'monospace'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      textColor: {
        primary: '#e8e6e1',
        muted: '#8a8f9e',
        dim: '#5a5f6e',
      },
    },
  },
  plugins: [],
}
