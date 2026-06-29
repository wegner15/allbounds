/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors (updated per design direction)
        primary: '#8fbac0',         // Subtler, welcoming pastel blue-green
        'primary-dark': '#6fa4ab',   // Hover / active shade
        'primary-light': '#b8d8dc',  // Tint / background highlight
        'quote-btn': '#c4a9af',      // Request a Quote CTA button
        'quote-btn-dark': '#b0939a', // Quote button hover shade
        charcoal: '#2D3748',
        'charcoal-light': '#4A5568',
        accent: '#F97316', // Warm Orange
        'accent-light': '#FB923C',
        'accent-dark': '#EA580C',
        success: '#10B981', // Green
        error: '#EF4444', // Red
        paper: '#FAFAFA', // Background
        'paper-dark': '#F5F5F5',

        // Legacy colors (keeping for backward compatibility)
        butter: '#eeca80',
        sand: '#edd785',
        teal: '#8fbac0', // Aligned with updated primary
        mint: '#58e5b1',
        footer: '#bab7ac',
        'primary-link': '#2D3748',
        hover: '#6fa4ab',
        
        // Extended grays
        'gray-50': '#FAFAFA',
        'gray-100': '#F5F5F5',
        'gray-200': '#E5E5E5',
        'gray-300': '#D4D4D4',
        'gray-400': '#A3A3A3',
        'gray-500': '#737373',
        'gray-600': '#525252',
        'gray-700': '#404040',
        'gray-800': '#262626',
        'gray-900': '#111827', // Text color
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2rem', { lineHeight: '2.5rem' }],      // 32px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
        'h1': ['2.5rem', '3.5rem'], // 40-56px
        'h2': ['2rem', '2.75rem'],   // 32-44px
        'body': ['1rem', '1.125rem'], // 16-18px
      },
      spacing: {
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'DEFAULT': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
        'inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
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
