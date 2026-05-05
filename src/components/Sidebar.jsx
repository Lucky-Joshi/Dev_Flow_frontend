import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-surface-1 border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-white">DevFlow</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
            isActive('/') ? 'bg-accent text-white' : 'text-gray-400 hover:bg-surface-2 hover:text-white'
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/projects"
          className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
            isActive('/projects') ? 'bg-accent text-white' : 'text-gray-400 hover:bg-surface-2 hover:text-white'
          }`}
        >
          Projects
        </Link>
      </nav>
    </aside>
  );
}
