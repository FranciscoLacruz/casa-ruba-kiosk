import { Component } from 'react';
import { HOTEL_TIERRA_PHONE } from './config/agents';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err, info) {
    console.error('[ErrorBoundary]', err, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          background: '#000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: '60px',
          height: '1px',
          background: 'linear-gradient(to right, transparent, #c8a96e, transparent)',
        }} />

        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '2rem',
          color: '#c8a96e',
          fontWeight: '400',
          letterSpacing: '0.1em',
        }}>
          Servicio no disponible
        </h1>

        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: '1.1rem',
          color: 'rgba(255,255,255,0.5)',
          maxWidth: '480px',
          lineHeight: 1.6,
        }}>
          Service unavailable · Service indisponible
        </p>

        <div style={{
          width: '60px',
          height: '1px',
          background: 'linear-gradient(to right, transparent, #c8a96e, transparent)',
          margin: '0.5rem 0',
        }} />

        <div style={{
          padding: '1.5rem 2.5rem',
          border: '1px solid rgba(200,169,110,0.3)',
          borderRadius: '12px',
        }}>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '0.8rem',
            color: 'rgba(200,169,110,0.5)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}>
            Hotel Tierra de Biescas
          </p>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: '2rem',
            color: '#c8a96e',
            letterSpacing: '0.1em',
          }}>
            {HOTEL_TIERRA_PHONE}
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            background: 'rgba(200,169,110,0.08)',
            border: '1px solid rgba(200,169,110,0.3)',
            borderRadius: '8px',
            color: 'rgba(200,169,110,0.8)',
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
            letterSpacing: '0.15em',
            padding: '0.75rem 2.5rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          Reiniciar · Restart
        </button>
      </div>
    );
  }
}
