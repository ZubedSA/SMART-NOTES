import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D3E26', // Deep Spruce Green
          light: '#1B5E3C',
          dark: '#082718',
        },
        accent: {
          DEFAULT: '#10B981', // Emerald Mint
          light: '#34D399',
          dark: '#059669',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft: '0 10px 25px -3px rgba(0, 0, 0, 0.03), 0 4px 6px -2px rgba(0, 0, 0, 0.01)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        premium: '0 8px 30px rgba(0, 0, 0, 0.03)',
        luxury: '0 20px 40px -15px rgba(0, 0, 0, 0.07)',
        glow: '0 0 20px rgba(16, 185, 129, 0.15)',
      },
    },
  },
  plugins: [],
};
export default config;
