module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
      extend: {
        colors: {
          space: {
            900: '#0b1020',
            800: '#111631',
            700: '#171d3f'
          }
        },
        boxShadow: {
          glow: '0 0 0 1px rgba(255,255,255,0.05), 0 10px 30px rgba(0,0,0,0.4), 0 0 30px rgba(125,211,252,0.25)'
        },
        backdropBlur: { xs: '2px' }
      }
    },
    plugins: []
  }