import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A3A5C',
          50: '#E8EEF4',
          100: '#C5D4E3',
          200: '#8AAAC7',
          300: '#4F80AB',
          400: '#2B5D8E',
          500: '#1A3A5C',
          600: '#142E48',
          700: '#0E2234',
          800: '#081620',
          900: '#020A0C',
        },
        rust: {
          DEFAULT: '#C0392B',
          50: '#F9ECEA',
          100: '#F0C8C4',
          200: '#E29088',
          300: '#D4584C',
          400: '#C0392B',
          500: '#962D22',
          600: '#6D2118',
          700: '#43140F',
          800: '#1A0806',
          900: '#0A0302',
        },
        gold: {
          DEFAULT: '#D4A017',
          50: '#FDF6E3',
          100: '#FAE8B0',
          200: '#F5CE6B',
          300: '#EDB426',
          400: '#D4A017',
          500: '#A57C12',
          600: '#76580D',
          700: '#473508',
          800: '#181203',
          900: '#080601',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
