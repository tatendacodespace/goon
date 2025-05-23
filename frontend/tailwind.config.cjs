/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#1E1E1E',
        primary: '#8B5CF6',
        secondary: '#06B6D4',
        accent: '#3B82F6',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}