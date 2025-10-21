export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          accent: '#C1A8FF',
          lavender: '#C1A8FF',
        },
      },
      backgroundImage: {
        // custom font gradient
        'text-null': 'linear-gradient(160deg, #000000 8%, #ffffff 75%)',
      },
    },
  },
};