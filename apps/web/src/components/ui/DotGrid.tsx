import { useRef, useEffect, useCallback } from 'react';

interface DotGridProps {
  className?: string;
  spacing?: number;
  dotRadius?: number;
  splitScale?: number;
  rippleRadius?: number;
}

interface Wave {
  x: number;
  y: number;
  startTime: number;
  duration: number;
  linear?: boolean;
  angle?: number;
  extentMin?: number;
  extentMax?: number;
}

export function DotGrid({
  className = '',
  spacing = 32,
  dotRadius = 1.5,
  splitScale = 4,
  rippleRadius = 140,
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wavesRef = useRef<Wave[]>([]);
  const rafRef = useRef(0);
  const lastMoveRef = useRef(0);

  const spawnWave = useCallback((x: number, y: number) => {
    wavesRef.current.push({ x, y, startTime: Date.now(), duration: 1000 });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const now = Date.now();

    ctx.clearRect(0, 0, w, h);

    const isDark = !document.documentElement.classList.contains('light');
    const baseColor = isDark ? '#444' : '#aaa';
    const colors = ['#FFD700', '#FF6B9D', '#00D68F'];

    const activeWaves = wavesRef.current.filter((wave) => now - wave.startTime < wave.duration);
    wavesRef.current = activeWaves;

    for (let x = spacing / 2; x < w; x += spacing) {
      for (let y = spacing / 2; y < h; y += spacing) {
        let maxIntensity = 0;
        let hueIdx = 0;

        for (const wave of activeWaves) {
          if (wave.linear) {
            const angle = wave.angle ?? 0;
            const proj = x * Math.cos(angle) + y * Math.sin(angle);
            const elapsed = now - wave.startTime;
            const progress = Math.min(elapsed / wave.duration, 1);
            const sweepStart = wave.extentMin ?? 0;
            const sweepEnd = wave.extentMax ?? 0;
            const front = sweepStart + (sweepEnd - sweepStart) * progress;
            const dist = Math.abs(proj - front);
            const halfWidth = (sweepEnd - sweepStart) * 0.08;
            if (dist < halfWidth) {
              const intensity = Math.cos((dist / halfWidth) * Math.PI / 2) * (1 - progress * 0.3);
              if (intensity > maxIntensity) {
                maxIntensity = intensity;
                hueIdx = Math.floor(progress * colors.length * 2) % colors.length;
              }
            }
          } else {
            const dx = x - wave.x;
            const dy = y - wave.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > rippleRadius) continue;

            const elapsed = now - wave.startTime;
            const progress = Math.min(elapsed / wave.duration, 1);
            const wavePos = dist / rippleRadius;
            const phase = (progress - wavePos) / 0.35;

            if (phase > 0 && phase < 1) {
              const intensity = Math.sin(phase * Math.PI) * Math.max(0, 1 - wavePos * 0.4);
              if (intensity > maxIntensity) {
                maxIntensity = intensity;
                hueIdx = Math.floor((dist / rippleRadius) * colors.length) % colors.length;
              }
            }
          }
        }

        const radius = dotRadius + maxIntensity * dotRadius * (splitScale - 1);

        if (maxIntensity > 0.08) {
          const alpha = Math.min(0.3 + maxIntensity * 0.7, 1);
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = colors[hueIdx];
          ctx.globalAlpha = alpha;
          ctx.fill();

          if (maxIntensity > 0.4) {
            const splitR = radius * 0.35;
            const splitAngle = maxIntensity * Math.PI * 4;
            for (let s = 0; s < 4; s++) {
              const sx = x + Math.cos(splitAngle + s * Math.PI / 2) * radius * 0.6;
              const sy = y + Math.sin(splitAngle + s * Math.PI / 2) * radius * 0.6;
              ctx.beginPath();
              ctx.arc(sx, sy, splitR * maxIntensity, 0, Math.PI * 2);
              ctx.fillStyle = colors[(hueIdx + 1 + s) % colors.length];
              ctx.globalAlpha = alpha * 0.6;
              ctx.fill();
            }
          }

          ctx.globalAlpha = 1;
        } else {
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fillStyle = baseColor;
          ctx.fill();
        }
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [spacing, dotRadius, splitScale, rippleRadius]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const now = Date.now();
      if (now - lastMoveRef.current < 40) return;
      lastMoveRef.current = now;
      spawnWave(e.clientX, e.clientY);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [spawnWave]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    let lastAuto = 0;
    const tick = () => {
      const now = Date.now();
      if (now - lastAuto > 2000) {
        lastAuto = now;
        const angle = Math.random() * Math.PI * 2;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const corners = [
          { x: 0, y: 0 },
          { x: window.innerWidth, y: 0 },
          { x: 0, y: window.innerHeight },
          { x: window.innerWidth, y: window.innerHeight },
        ];
        const proj = (px: number, py: number) => px * Math.cos(angle) + py * Math.sin(angle);
        const extents = corners.map((c) => proj(c.x, c.y));
        wavesRef.current.push({
          x: cx,
          y: cy,
          startTime: now,
          duration: 3500,
          linear: true,
          angle,
          extentMin: Math.min(...extents) - 20,
          extentMax: Math.max(...extents) + 20,
        });
      }
    };
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
    />
  );
}
