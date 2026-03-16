const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸', sub: 'Español' },
  { code: 'en', label: 'English', flag: '🇬🇧', sub: 'English' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', sub: 'Français' },
];

export default function LanguageScreen({ onSelectLanguage, onBack }) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at center, #0d0d0d 0%, #000000 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3rem',
        padding: '2rem',
      }}
    >
      {/* Encabezado */}
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '0.85rem',
            color: 'rgba(200,169,110,0.5)',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}
        >
          Casa Ruba · Biescas
        </p>
        <h2
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '2rem',
            fontWeight: '400',
            color: '#fff',
            letterSpacing: '0.05em',
          }}
        >
          Selecciona tu idioma
        </h2>
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.35)',
            marginTop: '0.5rem',
            letterSpacing: '0.05em',
          }}
        >
          Choose your language · Choisissez votre langue
        </p>
      </div>

      {/* Botones de idioma */}
      <div
        style={{
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {LANGUAGES.map(({ code, label, flag }) => (
          <button
            key={code}
            onClick={() => onSelectLanguage(code)}
            style={{
              width: '200px',
              height: '200px',
              background: 'rgba(200,169,110,0.05)',
              border: '1px solid rgba(200,169,110,0.25)',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              color: '#fff',
              fontFamily: 'Georgia, serif',
            }}
            onPointerDown={(e) => {
              e.currentTarget.style.background = 'rgba(200,169,110,0.15)';
              e.currentTarget.style.borderColor = 'rgba(200,169,110,0.7)';
              e.currentTarget.style.transform = 'scale(0.97)';
            }}
            onPointerUp={(e) => {
              e.currentTarget.style.background = 'rgba(200,169,110,0.05)';
              e.currentTarget.style.borderColor = 'rgba(200,169,110,0.25)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: '3.5rem', lineHeight: 1 }}>{flag}</span>
            <span
              style={{
                fontSize: '1.4rem',
                fontWeight: '400',
                letterSpacing: '0.05em',
                color: '#c8a96e',
              }}
            >
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Botón volver */}
      <button
        onClick={onBack}
        style={{
          marginTop: '1rem',
          background: 'transparent',
          border: 'none',
          color: 'rgba(255,255,255,0.3)',
          fontFamily: 'Georgia, serif',
          fontSize: '0.9rem',
          letterSpacing: '0.1em',
          cursor: 'pointer',
          padding: '0.75rem 2rem',
          textDecoration: 'underline',
          textUnderlineOffset: '4px',
        }}
      >
        ← Volver
      </button>
    </div>
  );
}
