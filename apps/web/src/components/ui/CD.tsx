interface CDProps {
  title?: string;
  artist?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = { sm: 'w-14 h-14', md: 'w-24 h-24', lg: 'w-48 h-48' };
const TEXT_SIZES = { sm: 'text-[6px]', md: 'text-[9px]', lg: 'text-sm' };
const HOLE_SIZES = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-12 h-12' };
const INNER_SIZES = { sm: 'w-1.5 h-1.5', md: 'w-2.5 h-2.5', lg: 'w-5 h-5' };

const COLORS = ['#FFD700', '#FF6B9D', '#0057FF', '#00D68F', '#B366FF', '#FF9500', '#FF3B30', '#00C7BE'];

function hashColor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function CD({ title = '', artist = '', size = 'sm', className = '' }: CDProps) {
  const accent = title ? hashColor(title) : '#FFD700';
  const sizeClass = SIZE_MAP[size];
  const textSize = TEXT_SIZES[size];
  const holeSize = HOLE_SIZES[size];
  const innerSize = INNER_SIZES[size];

  const label = title.split(' ').slice(0, 2).join(' ').substring(0, 12);

  return (
    <div className={`relative flex-shrink-0 ${sizeClass} ${className}`}>
      <div
        className="w-full h-full rounded-full brutal-border-thin flex items-center justify-center overflow-hidden"
        style={{
          background: `conic-gradient(${accent} 0deg, #fff 90deg, ${accent} 180deg, #ddd 270deg, ${accent} 360deg)`,
        }}
      >
        <div className={`${holeSize} rounded-full bg-[#1e1e1e] brutal-border-thin flex items-center justify-center`}>
          <div className={`${innerSize} rounded-full bg-accent`} style={{ backgroundColor: accent }} />
        </div>
        {size !== 'sm' && label && (
          <span
            className={`absolute ${textSize} font-black uppercase text-black tracking-tight leading-tight text-center px-1 pointer-events-none`}
            style={{
              textShadow: '0 0 3px rgba(255,255,255,0.8)',
              maxWidth: size === 'lg' ? '60%' : '70%',
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}