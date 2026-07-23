import { useRef, useState, useEffect } from 'react';

interface DotGridProps {
  diameter?: number;
  className?: string;
}

export function DotGrid({ diameter = 300, className = '' }: DotGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const onLeave = () => setPos({ x: -999, y: -999 });
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        maskImage: pos.x > 0 ? `radial-gradient(circle ${diameter / 2}px at ${pos.x}px ${pos.y}px, black, transparent)` : 'none',
        WebkitMaskImage: pos.x > 0 ? `radial-gradient(circle ${diameter / 2}px at ${pos.x}px ${pos.y}px, black, transparent)` : 'none',
        transition: 'mask-image 0.05s ease-out, -webkit-mask-image 0.05s ease-out',
      }}
    />
  );
}
