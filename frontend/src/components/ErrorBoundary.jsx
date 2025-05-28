import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error info here if needed
    // console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: '#fff', background: '#1a1a1a', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '2rem', color: '#f87171' }}>Something went wrong 😢</h1>
          <pre style={{ color: '#f87171', marginTop: 16 }}>{this.state.error?.message || 'Unknown error'}</pre>
          <p style={{ color: '#aaa', marginTop: 24 }}>Try refreshing the page or contact support if the problem persists.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
