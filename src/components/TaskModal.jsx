import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Save, Clock } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'TODO',  label: 'Todo',        color: 'text-gray-400' },
  { value: 'DOING', label: 'In Progress', color: 'text-blue-400' },
  { value: 'DONE',  label: 'Done',        color: 'text-emerald-400' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW',    label: 'Low',    color: 'text-emerald-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-amber-400' },
  { value: 'HIGH',   label: 'High',   color: 'text-red-400' },
];

export default function TaskModal({ task, onClose, onUpdate, onDelete }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    deadline: task?.deadline ? task.deadline.split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(task.id, form);
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    await onDelete(task.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface-1 border border-border rounded-2xl w-full max-w-lg shadow-card-hover"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-white font-semibold text-sm">Edit Task</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Description</label>
              <textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Status</label>
                <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Priority</label>
                <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Deadline</label>
              <input type="date" className="input" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>

            {/* Activity log */}
            {task.logs?.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 mb-2 block flex items-center gap-1.5">
                  <Clock size={11} /> Activity
                </label>
                <div className="space-y-1.5 max-h-28 overflow-y-auto bg-surface-2 rounded-lg p-3">
                  {task.logs.map((log) => (
                    <div key={log.id} className="flex gap-2 text-xs">
                      <span className="text-gray-700 flex-shrink-0">
                        {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-gray-500">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border">
            <button onClick={handleDelete} className="btn-danger flex items-center gap-1.5">
              <Trash2 size={13} /> Delete
            </button>
            <div className="flex gap-2">
              <button onClick={onClose} className="btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5">
                <Save size={13} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
