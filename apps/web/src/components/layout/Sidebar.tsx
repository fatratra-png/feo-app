import { NavLink } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';

const links = [
  { to: '/', label: 'Home', icon: '♫' },
  { to: '/search', label: 'Search', icon: '⌕' },
  { to: '/library', label: 'Library', icon: '☰' },
];

export function Sidebar() {
  const { isDark, toggle } = useThemeStore();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 brutal-border bg-white dark:bg-[#1a1a1a] z-40 flex flex-col">
      <div className="p-6 border-b-3 border-black dark:border-[#444]">
        <h1 className="text-3xl font-black tracking-tighter">FEO.</h1>
        <p className="text-xs font-mono mt-1 opacity-50">sound in Malagasy</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 brutal-border-thin text-sm font-bold uppercase transition-all ${
                isActive
                  ? 'bg-brutal-yellow text-black'
                  : 'bg-transparent hover:bg-gray-100 dark:hover:bg-[#333]'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t-3 border-black dark:border-[#444]">
        <button
          onClick={toggle}
          className="w-full brutal-btn px-4 py-2 text-xs font-bold bg-white dark:bg-[#333]"
        >
          {isDark ? '☀ Light' : '☾ Dark'}
        </button>
      </div>
    </aside>
  );
}