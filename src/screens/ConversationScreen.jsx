import { useEffect, useRef } from 'react';
import { useElevenLabs, ConversationStatus } from '../hooks/useElevenLabs';
import { getAgentId, HOTEL_TIERRA_PHONE, MAX_CONVERSATION_SECONDS } from '../config/agents';
import { UI_TEXTS } from '../i18n/ui';
import wallpaper from '../assets/wallpaper.png';
import rubaLogo from '../assets/ruba-logo.png';
import lcrLogo from '../assets/lcr-logo.png';

export default function ConversationScreen({ language, onEnd, onActivity }) {
  const t = UI_TEXTS[language] || UI_TEXTS.es;
  const { status, errorMessage, startConversation, endConversation } = useElevenLabs();
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
          height: '240px',
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
          top: '-4.5rem',
          right: '2rem',
          height: '400px',
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
          gap: '2.5rem',
          zIndex: 1,
        }}
      >
        {/* Orbe */}
        <div
          style={{
            position: 'relative',
            width: '180px',
            height: '180px',
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
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  border: '1px solid rgba(200,169,110,0.2)',
                  animation: 'ripple 2s ease-out infinite',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  border: '1px solid rgba(200,169,110,0.15)',
                  animation: 'ripple 2s ease-out infinite 0.6s',
                }}
              />
            </>
          )}

          <div
            style={{
              width: '120px',
              height: '120px',
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
                ? '0 0 40px rgba(139,0,0,0.4)'
                : isActive
                ? '0 0 60px rgba(200,169,110,0.5), 0 0 120px rgba(200,169,110,0.15)'
                : '0 0 30px rgba(200,169,110,0.15)',
              animation: status === ConversationStatus.CONNECTING
                ? 'breathe 1.5s ease-in-out infinite'
                : status === ConversationStatus.SPEAKING
                ? 'breathe 0.8s ease-in-out infinite'
                : 'none',
              transition: 'all 0.4s ease',
            }}
          />
        </div>

        {/* Waveform */}
        {isActive && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              height: '40px',
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '3px',
                  borderRadius: '2px',
                  background: '#c8a96e',
                  animation: `waveBar ${0.4 + (i % 4) * 0.15}s ease-in-out infinite alternate`,
                  animationDelay: `${(i * 0.07).toFixed(2)}s`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        )}

        {/* Estado textual */}
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.1rem',
            color: isError ? 'rgba(220,100,100,0.9)' : 'rgba(255,255,255,0.6)',
            letterSpacing: '0.05em',
            textAlign: 'center',
            maxWidth: '480px',
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
              fontSize: '1rem',
              letterSpacing: '0.1em',
              padding: '0.75rem 2.5rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t.convRetry}
          </button>
        )}
      </div>

      {/* Controles inferiores — centrados */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 2,
        }}
      >
        <button
          onClick={handleEnd}
          style={{
            background: '#9a9a5a',
            border: 'none',
            borderRadius: '16px',
            color: '#f0ead2',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: '2.2rem',
            fontWeight: '700',
            letterSpacing: '0.05em',
            padding: '1rem 3rem',
            cursor: 'pointer',
            transition: 'transform 0.15s ease',
            textTransform: 'uppercase',
          }}
          onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.93)'; }}
          onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {t.convEnd}
        </button>

        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.7rem',
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            lineHeight: 1.4,
          }}
        >
          {t.convPhoneHint}
        </p>
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '2.2rem',
            color: 'rgba(255,255,255,0.8)',
            fontWeight: '700',
            letterSpacing: '0.05em',
          }}
        >
          {HOTEL_TIERRA_PHONE}
        </p>
      </div>

      <style>{`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes waveBar {
          from { height: 6px; }
          to { height: 36px; }
        }
      `}</style>
    </div>
  );
}
