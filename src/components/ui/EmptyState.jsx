import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-3 flex items-center justify-center mb-4">
          <Icon size={24} className="text-gray-600" />
        </div>
      )}
      <p className="text-white font-medium mb-1">{title}</p>
      <p className="text-sm text-gray-600 mb-5">{description}</p>
      {action}
    </motion.div>
  );
}
