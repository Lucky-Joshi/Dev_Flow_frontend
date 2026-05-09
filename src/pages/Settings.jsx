import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Palette, LogOut } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function Settings() {
  const { user, logout } = useAuthStore();
  const [name, setName] = useState(user?.name ?? '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // Local only — extend to API call if needed
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in space-y-4">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-xs text-gray-600 mt-0.5">Manage your workspace preferences</p>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center gap-2 mb-4">
          <User size={15} className="text-accent" />
          <h2 className="text-sm font-semibold text-white">Profile</h2>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Display Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Email</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email ?? ''} disabled />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">Save Changes</button>
            {saved && <span className="text-xs text-emerald-400">Saved!</span>}
          </div>
        </form>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={15} className="text-accent" />
          <h2 className="text-sm font-semibold text-white">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Theme</p>
            <p className="text-xs text-gray-600 mt-0.5">Dark mode is always on — built for focus</p>
          </div>
          <div className="px-3 py-1.5 bg-surface-3 rounded-lg text-xs text-gray-400">Dark</div>
        </div>
      </motion.div>

      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={15} className="text-accent" />
          <h2 className="text-sm font-semibold text-white">Account</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Sign out</p>
            <p className="text-xs text-gray-600 mt-0.5">End your current session</p>
          </div>
          <button onClick={logout} className="btn-danger flex items-center gap-2">
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
