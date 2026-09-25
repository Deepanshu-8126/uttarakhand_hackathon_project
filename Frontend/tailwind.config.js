/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest-green': {
          DEFAULT: 'var(--color-forest-green)',
          hover: 'var(--color-forest-green-hover)',
          dark: 'var(--color-forest-green-dark)',
          darker: 'var(--color-forest-green-darker)',
        },
        'dark-green': {
          DEFAULT: 'var(--color-dark-green)',
          alt: 'var(--color-dark-green-alt)',
        },
        'cream': {
          DEFAULT: 'var(--color-cream)',
          alt: 'var(--color-cream-alt)',
        },
        'warm-white': 'var(--color-warm-white)',
        'beige': {
          DEFAULT: 'var(--color-beige)',
          alt: 'var(--color-beige-alt)',
        },
        'earth-brown': 'var(--color-earth-brown)',
        'text-dark': 'var(--color-text-dark)',
        'muted-text': 'var(--color-muted-text)',
        'border-light': 'var(--color-border-light)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
