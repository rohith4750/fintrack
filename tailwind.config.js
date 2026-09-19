/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#627d98',
          500: '#486581',
          600: '#334e68',
          700: '#243b53',
          800: '#102a43',
          900: '#0b192c',
          950: '#07101e',
        },
        brand: {
          dark: '#0b192c',
          navy: '#0f2744',
          subtle: '#193555',
          accent: '#1e40af',
          light: '#2563eb',
          highlight: '#38bdf8',
        }
      },
      borderRadius: {
        none: '0px',
        sm: '3px',
        DEFAULT: '5px',
        md: '5px',
        lg: '5px',
        xl: '5px',
        '2xl': '5px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(11, 25, 44, 0.07), 0 1px 2px -1px rgba(11, 25, 44, 0.05)',
        elevated: '0 4px 6px -1px rgba(11, 25, 44, 0.1), 0 2px 4px -2px rgba(11, 25, 44, 0.06)',
        dropdown: '0 10px 15px -3px rgba(11, 25, 44, 0.12), 0 4px 6px -4px rgba(11, 25, 44, 0.08)',
      },
      fontSize: {
        '2xs': '0.65rem',
        xs: '0.75rem',
        sm: '0.8125rem',
        base: '0.875rem',
        lg: '1rem',
        xl: '1.125rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
};
