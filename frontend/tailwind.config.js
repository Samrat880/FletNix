/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        fletnix: {
          red: '#E50914',
          redSoft: '#ff3042',
          ink: '#05060c',
          dark: '#0a0b12',
          panel: '#10121f',
          card: '#161828',
          line: '#252a3d',
          muted: '#9aa3bf',
          chip: '#1a2035',
          success: '#2ecc71',
          warn: '#f2c94c',
        },
      },
      fontFamily: {
        heading: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(229, 9, 20, 0.45), 0 8px 24px rgba(229, 9, 20, 0.2)',
        panel: '0 16px 40px rgba(3, 8, 24, 0.45)',
      },
      borderRadius: {
        xl2: '1rem',
      },
      backgroundImage: {
        noise:
          'radial-gradient(circle at 20% 0%, rgba(229,9,20,0.12), transparent 35%), radial-gradient(circle at 80% 100%, rgba(30,56,150,0.2), transparent 35%)',
      },
    },
  },
  plugins: [],
};
