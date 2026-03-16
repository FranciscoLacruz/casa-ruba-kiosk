import { useEffect, useRef } from 'react';

export default function IdleScreen({ onTouch }) {
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

    // Inicializar partículas doradas
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

      // Dibujar líneas entre partículas cercanas
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
        background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {/* Canvas de partículas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Contenido central */}
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
        <div
          style={{
            width: '60px',
            height: '1px',
            background: 'linear-gradient(to right, transparent, #c8a96e, transparent)',
            marginBottom: '0.5rem',
          }}
        />

        {/* Título */}
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '4.5rem',
            fontWeight: '400',
            color: '#c8a96e',
            letterSpacing: '0.15em',
            textShadow: '0 0 40px rgba(200,169,110,0.3)',
            lineHeight: 1,
          }}
        >
          Casa Ruba
        </h1>

        {/* Subtítulo */}
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.1rem',
            fontWeight: '400',
            color: 'rgba(200,169,110,0.6)',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
          }}
        >
          Hotel · Biescas
        </p>

        {/* Línea decorativa */}
        <div
          style={{
            width: '60px',
            height: '1px',
            background: 'linear-gradient(to right, transparent, #c8a96e, transparent)',
            marginTop: '0.5rem',
            marginBottom: '2rem',
          }}
        />

        {/* CTA pulsante */}
        <p
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '1.25rem',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.1em',
            animation: 'pulse 2.5s ease-in-out infinite',
          }}
        >
          Toca para comenzar
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
