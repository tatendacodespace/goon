export const theme = {
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#8B5CF6', // Purple
    secondary: '#06B6D4', // Teal
    accent: '#3B82F6', // Electric Blue
    text: {
      primary: '#FFFFFF',
      secondary: '#A1A1AA',
      muted: '#71717A'
    },
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B'
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    glow: '0 0 15px rgba(139, 92, 246, 0.3)'
  },
  animations: {
    transition: 'all 0.3s ease-in-out',
    hover: 'transform hover:scale-105',
    button: 'transform hover:scale-105 active:scale-95'
  }
};

export const commonStyles = {
  card: 'bg-surface rounded-2xl shadow-lg p-6 border border-gray-800 hover:border-primary/30 transition-all duration-300',
  button: {
    primary: 'bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-glow transition-all duration-300',
    secondary: 'bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-glow transition-all duration-300',
    outline: 'border-2 border-primary text-primary hover:bg-primary/10 font-bold py-3 px-6 rounded-xl transition-all duration-300'
  },
  input: `
    w-full
    bg-gray-900/50
    border-2
    border-gray-700
    rounded-xl
    px-4
    py-3
    text-white
    placeholder-gray-500
    focus:border-primary
    focus:ring-2
    focus:ring-primary/20
    outline-none
    transition-all
    duration-300
    hover:border-gray-600
    disabled:opacity-50
    disabled:cursor-not-allowed
    [&::-webkit-inner-spin-button]:appearance-none
    [&::-webkit-outer-spin-button]:appearance-none
  `,
  heading: {
    h1: 'text-4xl md:text-5xl font-bold text-white mb-6',
    h2: 'text-3xl md:text-4xl font-bold text-white mb-4',
    h3: 'text-2xl md:text-3xl font-bold text-white mb-3'
  },
  badge: 'bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-sm',
  link: 'text-indigo-400 hover:text-indigo-300 transition-colors duration-200'
}; 