import wallpaper from '../assets/wallpaper.png';
import rubaLogo from '../assets/ruba-logo.png';
import lcrLogo from '../assets/lcr-logo.png';
import recepcionista from '../assets/recepcionista-virtual.png';
import flagEs from '../assets/flag-es.png';
import flagFr from '../assets/flag-fr.png';
import flagEn from '../assets/flag-en.png';

const flagButtonStyle = {
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  transition: 'transform 0.15s ease',
};

const flagImgStyle = {
  height: '120px',
  width: 'auto',
  pointerEvents: 'none',
};

export default function IdleScreen({ onSelectLanguage }) {
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

      {/* Logo RUBA — esquina superior izquierda */}
      <img
        src={rubaLogo}
        alt="RUBA Posada de Montaña"
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          height: '240px',
          width: 'auto',
          zIndex: 1,
        }}
      />

      {/* Logo LCR — esquina superior derecha */}
      <img
        src={lcrLogo}
        alt="LCR Hoteles y Apartamentos"
        style={{
          position: 'absolute',
          top: '-4.5rem',
          right: '2rem',
          height: '400px',
          width: 'auto',
          zIndex: 1,
        }}
      />

      {/* Icono recepcionista virtual — centro */}
      <img
        src={recepcionista}
        alt="Recepcionista Virtual 24/7"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -60%)',
          height: '420px',
          width: 'auto',
          zIndex: 1,
        }}
      />

      {/* Botones de idioma — parte inferior */}
      <div
        style={{
          position: 'absolute',
          bottom: '3rem',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem',
          zIndex: 1,
          padding: '0 2rem',
        }}
      >
        <button
          onClick={() => onSelectLanguage('fr')}
          style={flagButtonStyle}
          onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.93)'; }}
          onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <img src={flagFr} alt="Touchez pour commencer" style={flagImgStyle} />
        </button>

        <button
          onClick={() => onSelectLanguage('es')}
          style={flagButtonStyle}
          onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.93)'; }}
          onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <img src={flagEs} alt="Toca para comenzar" style={flagImgStyle} />
        </button>

        <button
          onClick={() => onSelectLanguage('en')}
          style={flagButtonStyle}
          onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.93)'; }}
          onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          onPointerLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <img src={flagEn} alt="Tap to start" style={flagImgStyle} />
        </button>
      </div>

      {/* Versión */}
      <p
        style={{
          position: 'absolute',
          bottom: '0.75rem',
          right: '1rem',
          fontFamily: 'Georgia, serif',
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: '0.05em',
          zIndex: 1,
        }}
      >
        v{__APP_VERSION__}
      </p>
    </div>
  );
}
