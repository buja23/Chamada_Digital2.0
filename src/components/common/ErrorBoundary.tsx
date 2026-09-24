import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary global — captura erros de renderização React e exibe
 * uma tela amigável em vez de tela branca silenciosa.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Erro capturado:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '24px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            color: '#111827',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}
          >
            😕
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
            Algo deu errado
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px', maxWidth: '360px' }}>
            Ocorreu um erro inesperado. Recarregue a página — se o problema
            persistir, entre em contato com o suporte.
          </p>
          <button
            onClick={this.handleReload}
            style={{
              padding: '10px 24px',
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🔄 Recarregar página
          </button>
          <details
            style={{
              marginTop: '24px',
              fontSize: '12px',
              color: '#9ca3af',
              maxWidth: '480px',
              textAlign: 'left',
            }}
          >
            <summary style={{ cursor: 'pointer' }}>Detalhes técnicos</summary>
            <pre
              style={{
                marginTop: '8px',
                padding: '12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error?.message}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
