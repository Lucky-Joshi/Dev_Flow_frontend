import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, sub, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="stat-card group"
    >
      {/* subtle gradient blob */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 ${gradient}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
          {Icon && <Icon size={15} className="text-gray-600" />}
        </div>
        <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
        {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}
