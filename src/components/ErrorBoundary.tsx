import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400,
          color: 'var(--text-primary)', marginBottom: 10,
        }}>
          Algo deu errado
        </h2>
        <p style={{
          color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65,
          maxWidth: 420, marginBottom: 24,
        }}>
          {this.state.error?.message ?? 'Ocorreu um erro inesperado nesta seção.'}
        </p>
        <button
          className="btn-ghost"
          onClick={() => this.setState({ hasError: false, error: null })}
        >
          Tentar novamente
        </button>
      </div>
    );
  }
}
