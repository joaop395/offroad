/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold:      '#C9A227',
        'gold-dark': '#A8831A',
        military:  '#4A5C28',
        offblack:  '#0a0a0a',
        card:      '#111111',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        mono:    ['"DM Mono"', 'monospace'],
        body:    ['"Barlow Condensed"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
