import { useEffect, useRef } from 'react';
import { LANGUAGES } from '../config/agents';
import { UI_TEXTS } from '../i18n/ui';

export default function IdleScreen({ onTouch  }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const N = 60;
    particlesRef.current = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 169, 110, ${p.alpha})`;
        ctx.fill();
      });

      const ps = particlesRef.current;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(200, 169, 110, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      onClick={onTouch}
      style={{
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at center, #0a2e1a 0%, #003310 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {/* Línea decorativa */}
        <div style={{
          width: '60px',
          height: '1px',
          background: 'linear-gradient(to right, transparent, #c8a96e, transparent)',
          marginBottom: '0.5rem',
        }} />

        {/* Título */}
        <h1 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '4.5rem',
          fontWeight: '400',
          color: '#c8a96e',
          letterSpacing: '0.15em',
          textShadow: '0 0 40px rgba(200,169,110,0.3)',
          lineHeight: 1,
        }}>
          La Posada de Ruba
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: '1.05rem',
          color: 'rgba(200,169,110,0.6)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          Tu recepcionista virtual · Disponible 24h
        </p>

        {/* Línea decorativa */}
        <div style={{
          width: '60px',
          height: '1px',
          background: 'linear-gradient(to right, transparent, #c8a96e, transparent)',
          margin: '1rem 0 2rem',
        }} />

        {/* CTAs en los 3 idiomas — decorativos, pulso escalonado */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.15rem',
        }}>
          {LANGUAGES.map((lang, index) => (
            <p
              key={lang.code}
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: index === 0 ? '1.25rem' : '1rem',
                color: index === 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.28)',
                letterSpacing: '0.1em',
                padding: '0.3rem 0',
                animation: 'pulse 2.5s ease-in-out infinite',
                animationDelay: `${index * 0.5}s`,
              }}
            >
              {UI_TEXTS[lang.code].idleCta}
            </p>
          ))}
        </div>
      </div>

      <p style={{
        position: 'absolute',
        bottom: '0.75rem',
        right: '1rem',
        fontFamily: 'Georgia, serif',
        fontSize: '0.65rem',
        color: 'rgba(255,255,255,0.3)',
        letterSpacing: '0.05em',
      }}>
        v{__APP_VERSION__}
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
