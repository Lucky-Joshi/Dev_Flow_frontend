import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, LogOut, Search, Menu } from 'lucide-react';
import useAuthStore from '../store/authStore';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1] ?? 'DevFlow';

  return (
    <header className="h-14 glass border-b border-border flex items-center justify-between px-3 md:px-6 flex-shrink-0 z-10">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-3 transition-colors"
      >
        <Menu size={18} className="text-gray-400" />
      </button>

      <h2 className="text-sm font-semibold text-white flex-1 md:flex-none text-center md:text-left">{title}</h2>

      <div className="flex items-center gap-2">
        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((s) => !s)}
            className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg hover:bg-surface-3 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <span className="text-accent text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 w-44 bg-surface-2 border border-border rounded-xl shadow-card-hover z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs text-white font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-600 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setShowMenu(false); logout(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
