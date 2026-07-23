import { NavLink } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';

const links = [
  { to: '/', label: 'Home', icon: '♫' },
  { to: '/search', label: 'Search', icon: '⌕' },
  { to: '/discover', label: 'Discover', icon: '🌐' },
  { to: '/library', label: 'Library', icon: '☰' },
];

export function Sidebar() {
  const { isDark, toggle } = useThemeStore();

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 brutal-border bg-[#1e1e1e] z-40 flex flex-col">
      <div className="p-8 border-b-3 border-[#333]">
        <h1 className="text-4xl font-black tracking-tighter">
          <span className="text-brutal-yellow">F</span>
          <span className="text-brutal-pink">E</span>
          <span className="text-brutal-blue">O</span>
          <span className="text-brutal-red">.</span>
        </h1>
        <p className="text-xs font-mono mt-2 opacity-40">Henoy ara</p>
      </div>

      <nav className="flex-1 p-5 space-y-1.5">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-4 px-5 py-4 brutal-border-thin text-sm font-black uppercase tracking-wide transition-all ${
                isActive
                  ? 'bg-brutal-yellow text-black'
                  : 'bg-transparent hover:bg-[#333]'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-5 border-t-3 border-[#333] space-y-3">
        <button
          onClick={toggle}
          className="w-full brutal-btn px-5 py-3 text-xs font-black tracking-wider"
        >
          {isDark ? '☀ Switch to Light' : '☾ Switch to Dark'}
        </button>
      </div>
    </aside>
  );
}