module.exports = {
  purge: ['./public/**/*.html', './src/**/*.{js,jsx,ts,tsx,vue}'],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        customColor: '#FF9934',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};