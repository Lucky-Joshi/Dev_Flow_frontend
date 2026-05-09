import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Lock } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(form.email, form.password);
    if (ok) navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-sm relative z-10 px-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-glow"
          >
            <Zap size={20} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white tracking-tight">DevFlow</h1>
          <p className="text-gray-600 text-sm mt-1">Private productivity workspace</p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="bg-surface-1/90 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-card-hover"
        >
          <div className="flex items-center gap-2 mb-5">
            <Lock size={13} className="text-gray-600" />
            <h2 className="text-sm font-semibold text-white">Sign in to your workspace</h2>
          </div>

          {error && (
            <motion.div
              key={error}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2.5 rounded-lg mb-4"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Email</label>
              <input
                type="email"
                className="input"
                placeholder="admin@devflow.local"
                value={form.email}
                onChange={(e) => { clearError(); setForm({ ...form, email: e.target.value }); }}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Password</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => { clearError(); setForm({ ...form, password: e.target.value }); }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2 h-10"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Enter workspace</span><ArrowRight size={14} /></>
              )}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-xs text-gray-700 mt-5">
          Personal access only · DevFlow OS
        </p>
      </motion.div>
    </div>
  );
}
