/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#3c4852',
        paper: '#ecebdd',
        butter: '#eeca80',
        sand: '#edd785',
        teal: '#8cb9bf',
        mint: '#58e5b1',
        footer: '#bab7ac',
        'primary-link': '#3c4852',
        hover: '#b54359',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'lato': ['Lato', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2.5rem', '3.5rem'], // 40-56px
        'h2': ['2rem', '2.75rem'],   // 32-44px
        'body': ['1rem', '1.125rem'], // 16-18px
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#374151',
            fontFamily: '"Lato", sans-serif',
            h1: {
              fontFamily: '"Playfair Display", serif',
              color: '#3c4852',
              fontWeight: '600',
            },
            h2: {
              fontFamily: '"Playfair Display", serif',
              color: '#3c4852',
              fontWeight: '600',
            },
            h3: {
              fontFamily: '"Playfair Display", serif',
              color: '#3c4852',
              fontWeight: '600',
            },
            h4: {
              fontFamily: '"Playfair Display", serif',
              color: '#3c4852',
              fontWeight: '600',
            },
            h5: {
              fontFamily: '"Playfair Display", serif',
              color: '#3c4852',
              fontWeight: '600',
            },
            h6: {
              fontFamily: '"Playfair Display", serif',
              color: '#3c4852',
              fontWeight: '600',
            },
            strong: {
              fontFamily: '"Lato", sans-serif',
              color: '#3c4852',
              fontWeight: '600',
            },
            em: {
              fontFamily: '"Lato", sans-serif',
            },
            a: {
              color: '#2563eb',
              '&:hover': {
                color: '#1d4ed8',
              },
            },
            blockquote: {
              borderLeftColor: '#8cb9bf',
              backgroundColor: '#f9fafb',
              padding: '1rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
