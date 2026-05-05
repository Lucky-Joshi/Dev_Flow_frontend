import useAuthStore from '../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-14 bg-surface-1 border-b border-border flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">{user?.name}</span>
        <button onClick={logout} className="btn-ghost text-xs">
          Sign out
        </button>
      </div>
    </header>
  );
}
