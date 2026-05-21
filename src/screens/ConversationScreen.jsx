import { useEffect, useRef } from 'react';
import { useElevenLabs, ConversationStatus } from '../hooks/useElevenLabs';
import { getAgentId, HOTEL_TIERRA_PHONE, MAX_CONVERSATION_SECONDS } from '../config/agents';
import { UI_TEXTS } from '../i18n/ui';

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
        background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '3rem 2rem',
      }}
    >
      {/* Encabezado */}
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '0.8rem',
            color: 'rgba(200,169,110,0.45)',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
          }}
        >
          La Posada de Ruba · {t.convTitle}
        </p>
      </div>

      {/* Orbe central */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.5rem',
          flex: 1,
          justifyContent: 'center',
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
          {/* Anillos externos animados */}
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

          {/* Orbe principal */}
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

        {/* Waveform (barra animada según estado) */}
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

      {/* Controles inferiores */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          width: '100%',
          maxWidth: '480px',
        }}
      >
        {/* Teléfono de recepción */}
        <div
          style={{
            textAlign: 'center',
            padding: '0.75rem 1.5rem',
            border: '1px solid rgba(200,169,110,0.15)',
            borderRadius: '8px',
            width: '100%',
          }}
        >
          <p
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '0.75rem',
              color: 'rgba(200,169,110,0.45)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: '0.25rem',
            }}
          >
            {t.convPhoneHint}
          </p>
          <p
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '1.2rem',
              color: 'rgba(200,169,110,0.7)',
              letterSpacing: '0.1em',
            }}
          >
            {HOTEL_TIERRA_PHONE}
          </p>
        </div>

        {/* Botón Finalizar */}
        <button
          onClick={handleEnd}
          style={{
            width: '100%',
            padding: '1rem',
            background: 'rgba(200,169,110,0.08)',
            border: '1px solid rgba(200,169,110,0.3)',
            borderRadius: '8px',
            color: 'rgba(200,169,110,0.8)',
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
            letterSpacing: '0.15em',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.2s',
          }}
          onPointerDown={(e) => {
            e.currentTarget.style.background = 'rgba(200,169,110,0.18)';
          }}
          onPointerUp={(e) => {
            e.currentTarget.style.background = 'rgba(200,169,110,0.08)';
          }}
        >
          {t.convEnd}
        </button>
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
