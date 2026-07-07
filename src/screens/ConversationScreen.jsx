import { useEffect, useRef, useState, useCallback } from 'react';
import { useElevenLabs, ConversationStatus } from '../hooks/useElevenLabs';
import { getAgentId, HOTEL_TIERRA_PHONE, MAX_CONVERSATION_SECONDS } from '../config/agents';
import { UI_TEXTS } from '../i18n/ui';
import wallpaper from '../assets/wallpaper.jpg';
import rubaLogo from '../assets/ruba-logo.png';
import lcrLogo from '../assets/lcr-logo.png';
import mapaHotel from '../assets/mapa-hotel-tierra.jpg';
import qrReservas from '../assets/qr_reservas.jpeg';

const MAP_DISPLAY_SECONDS = 30;
const QR_DISPLAY_SECONDS = 30;

const KEYFRAMES_CSS = `
  @keyframes ripple {
    0% { transform: scale(1); opacity: 0.6; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  @keyframes breathe {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.06); }
  }
  @keyframes waveBar {
    from { height: 12px; }
    to { height: 72px; }
  }
`;

export default function ConversationScreen({ language, onEnd, onActivity }) {
  const t = UI_TEXTS[language] || UI_TEXTS.es;
  const [showMap, setShowMap] = useState(false);
  const mapTimerRef = useRef(null);
  const [showQr, setShowQr] = useState(false);
  const qrTimerRef = useRef(null);

  const handleClientToolCall = useCallback((toolName) => {
    if (toolName === 'obtener_direcciones_hotel') {
      setShowQr(false);
      clearTimeout(qrTimerRef.current);
      setShowMap(true);
      clearTimeout(mapTimerRef.current);
      mapTimerRef.current = setTimeout(() => setShowMap(false), MAP_DISPLAY_SECONDS * 1000);
    } else if (toolName === 'mostrar_qr_reserva') {
      setShowMap(false);
      clearTimeout(mapTimerRef.current);
      setShowQr(true);
      clearTimeout(qrTimerRef.current);
      qrTimerRef.current = setTimeout(() => setShowQr(false), QR_DISPLAY_SECONDS * 1000);
    }
  }, []);

  const { status, errorMessage, startConversation, endConversation } = useElevenLabs({
    onClientToolCall: handleClientToolCall,
  });
  const wasActiveRef = useRef(false);
  const maxTimerRef = useRef(null);

  useEffect(() => {
    const agentId = getAgentId(language);
    startConversation(agentId);

    maxTimerRef.current = setTimeout(() => {
      endConversation();
      onEnd();
    }, MAX_CONVERSATION_SECONDS * 1000);

    return () => {
      clearTimeout(maxTimerRef.current);
      clearTimeout(mapTimerRef.current);
      clearTimeout(qrTimerRef.current);
      endConversation();
    };
  }, [language]);

  useEffect(() => {
    const isActive = status === ConversationStatus.LISTENING || status === ConversationStatus.SPEAKING;

    if (isActive) {
      wasActiveRef.current = true;
      onActivity?.();
    }

    if (status === ConversationStatus.IDLE && wasActiveRef.current) {
      onEnd();
    }
  }, [status]);

  function handleEnd() {
    clearTimeout(mapTimerRef.current);
    clearTimeout(qrTimerRef.current);
    endConversation();
    onEnd();
  }

  const statusLabel = {
    [ConversationStatus.IDLE]: t.convIdle,
    [ConversationStatus.CONNECTING]: t.convConnecting,
    [ConversationStatus.LISTENING]: t.convListening,
    [ConversationStatus.SPEAKING]: t.convSpeaking,
    [ConversationStatus.ERROR]: errorMessage ? t[errorMessage] || t.convError : t.convError,
  }[status];

  const isError = status === ConversationStatus.ERROR;
  const isActive = status === ConversationStatus.LISTENING || status === ConversationStatus.SPEAKING;

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Wallpaper de fondo */}
      <img
        src={wallpaper}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Overlay oscuro para contraste con el orbe */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          zIndex: 0,
        }}
      />

      {/* Logo RUBA — esquina superior izquierda */}
      <img
        src={rubaLogo}
        alt="RUBA"
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          height: '360px',
          width: 'auto',
          zIndex: 2,
        }}
      />

      {/* Logo LCR — esquina superior derecha */}
      <img
        src={lcrLogo}
        alt="LCR"
        style={{
          position: 'absolute',
          top: '-6.75rem',
          right: '2rem',
          height: '600px',
          width: 'auto',
          zIndex: 2,
        }}
      />

      {/* Bloque central: orbe + waveform + status */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3rem',
          zIndex: 1,
        }}
      >
        {/* Orbe */}
        <div
          style={{
            position: 'relative',
            width: '360px',
            height: '360px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isActive && (
            <>
              <div
                style={{
                  position: 'absolute',
                  width: '360px',
                  height: '360px',
                  borderRadius: '50%',
                  border: '2px solid rgba(200,169,110,0.2)',
                  animation: 'ripple 2s ease-out infinite',
                  willChange: 'transform, opacity',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: '360px',
                  height: '360px',
                  borderRadius: '50%',
                  border: '2px solid rgba(200,169,110,0.15)',
                  animation: 'ripple 2s ease-out infinite 0.6s',
                  willChange: 'transform, opacity',
                }}
              />
            </>
          )}

          <div
            style={{
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: isError
                ? 'radial-gradient(circle at 35% 35%, #8b0000, #3d0000)'
                : status === ConversationStatus.SPEAKING
                ? 'radial-gradient(circle at 35% 35%, #e0c898, #a08040)'
                : status === ConversationStatus.LISTENING
                ? 'radial-gradient(circle at 35% 35%, #c8a96e, #7a6030)'
                : status === ConversationStatus.CONNECTING
                ? 'radial-gradient(circle at 35% 35%, #8a7040, #3a2e18)'
                : 'radial-gradient(circle at 35% 35%, #3a3020, #1a1408)',
              boxShadow: isError
                ? '0 0 80px rgba(139,0,0,0.4)'
                : isActive
                ? '0 0 120px rgba(200,169,110,0.5), 0 0 240px rgba(200,169,110,0.15)'
                : '0 0 60px rgba(200,169,110,0.15)',
              animation: status === ConversationStatus.CONNECTING
                ? 'breathe 1.5s ease-in-out infinite'
                : status === ConversationStatus.SPEAKING
                ? 'breathe 0.8s ease-in-out infinite'
                : 'none',
              transition: 'all 0.4s ease',
              willChange: 'transform',
            }}
          />
        </div>

        {/* Waveform */}
        {isActive && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '80px',
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '6px',
                  borderRadius: '3px',
                  background: '#c8a96e',
                  animation: `waveBar ${0.4 + (i % 4) * 0.15}s ease-in-out infinite alternate`,
                  animationDelay: `${(i * 0.07).toFixed(2)}s`,
                  opacity: 0.7,
                  willChange: 'height',
                }}
              />
            ))}
          </div>
        )}

        {/* Estado textual */}
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '2.2rem',
            color: isError ? 'rgba(220,100,100,0.9)' : 'rgba(255,255,255,0.6)',
            letterSpacing: '0.05em',
            textAlign: 'center',
            maxWidth: '960px',
            lineHeight: 1.5,
          }}
        >
          {statusLabel}
        </p>

        {/* Botón retry en error */}
        {isError && (
          <button
            onClick={() => startConversation(getAgentId(language))}
            style={{
              background: 'transparent',
              border: '1px solid rgba(200,169,110,0.4)',
              borderRadius: '8px',
              color: '#c8a96e',
              fontFamily: 'Georgia, serif',
              fontSize: '2rem',
              letterSpacing: '0.1em',
              padding: '1.5rem 5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.convRetry}
          </button>
        )}
      </div>

      {/* Botón FINALIZAR — esquina inferior izquierda */}
      <button
        onClick={handleEnd}
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '2rem',
          background: '#9a9a5a',
          border: 'none',
          borderRadius: '13px',
          color: '#f0ead2',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '3.52rem',
          fontWeight: '700',
          letterSpacing: '0.05em',
          padding: '1.6rem 3.2rem',
          cursor: 'pointer',
          zIndex: 2,
          transition: 'transform 0.15s ease',
          textTransform: 'uppercase',
        }}
        onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.93)'; }}
        onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {t.convEnd}
      </button>

      {/* Teléfono — esquina inferior derecha (informativo) */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          right: '2rem',
          border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '13px',
          padding: '1.6rem 3.2rem',
          zIndex: 2,
        }}
      >
        <p
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '3.52rem',
            fontWeight: '700',
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
          }}
        >
          {HOTEL_TIERRA_PHONE}
        </p>
      </div>

      {/* Overlay del mapa */}
      {showMap && (
        <div
          onClick={() => setShowMap(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            cursor: 'pointer',
          }}
        >
          <img
            src={mapaHotel}
            alt="Mapa Hotel Tierra de Biescas"
            style={{
              maxWidth: '85%',
              maxHeight: '85%',
              objectFit: 'contain',
              borderRadius: '16px',
            }}
          />
          <button
            onClick={() => setShowMap(false)}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              color: '#fff',
              fontSize: '2.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Overlay del QR de reservas */}
      {showQr && (
        <div
          onClick={() => setShowQr(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            cursor: 'pointer',
          }}
        >
          <img
            src={qrReservas}
            alt="QR Reservas"
            style={{
              maxWidth: '85%',
              maxHeight: '85%',
              objectFit: 'contain',
              borderRadius: '16px',
            }}
          />
          <button
            onClick={() => setShowQr(false)}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              color: '#fff',
              fontSize: '2.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <style>{KEYFRAMES_CSS}</style>
    </div>
  );
}
