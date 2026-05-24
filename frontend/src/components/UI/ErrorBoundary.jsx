import React from 'react';
import { T } from '@/tokens';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1C1917', color: '#F5F5F4', fontFamily: T.font }}>
          <h1 style={{ color: T.danger, fontFamily: T.fontSerif, fontSize: 32 }}>Something went wrong.</h1>
          <p style={{ color: '#A8A29E', marginTop: 8 }}>The application encountered an unexpected error.</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 24, padding: '10px 20px', background: T.amber, color: '#1C1917', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}