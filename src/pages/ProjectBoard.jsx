import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, X, Kanban, BarChart3, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import KanbanBoard from '../components/KanbanBoard';
import Spinner from '../components/ui/Spinner';

const TABS = [
  { id: 'board',     label: 'Board',     icon: Kanban },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'notes',     label: 'Notes',     icon: FileText },
];

const PRIORITY_CONFIG = {
  LOW:    { color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  MEDIUM: { color: 'text-amber-400',   bg: 'bg-amber-400/10' },
  HIGH:   { color: 'text-red-400',     bg: 'bg-red-400/10' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs shadow-card">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} tasks</p>
    </div>
  );
};

export default function ProjectBoard() {
  const { id } = useParams();
  const { fetchProject, currentProject, updateProject } = useProjectStore();
  const { tasks, fetchTasks, createTask } = useTaskStore();
  const [activeTab, setActiveTab] = useState('board');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('TODO');
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'MEDIUM', deadline: '', status: 'TODO' });
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchProject(id);
    fetchTasks(id);
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    await createTask({ ...taskForm, status: defaultStatus, projectId: id });
    setTaskForm({ title: '', description: '', priority: 'MEDIUM', deadline: '', status: 'TODO' });
    setShowTaskForm(false);
    setSaving(false);
  };

  const openAddTask = (status = 'TODO') => {
    setDefaultStatus(status);
    setShowTaskForm(true);
  };

  // Analytics data
  const statusCounts = ['TODO', 'DOING', 'DONE'].map((s) => ({
    status: s === 'TODO' ? 'Backlog' : s === 'DOING' ? 'In Progress' : 'Done',
    count: tasks.filter((t) => t.status === s).length,
  }));

  const priorityCounts = ['LOW', 'MEDIUM', 'HIGH'].map((p) => ({
    priority: p,
    count: tasks.filter((t) => t.priority === p).length,
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0 glass">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/projects" className="text-gray-600 hover:text-white transition-colors">Projects</Link>
          <ChevronRight size={14} className="text-gray-700" />
          <span className="text-white font-medium">{currentProject?.name ?? '...'}</span>
        </div>
        <button onClick={() => openAddTask()} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Add Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-border flex-shrink-0">
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            onClick={() => setActiveTab(tid)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tid
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-gray-500 hover:text-white hover:bg-surface-3'
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'board' && (
            <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <KanbanBoard projectId={id} onAddTask={openAddTask} />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 max-w-4xl">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Tasks', value: tasks.length, color: 'text-white' },
                  { label: 'Completed',   value: tasks.filter((t) => t.status === 'DONE').length, color: 'text-emerald-400' },
                  { label: 'In Progress', value: tasks.filter((t) => t.status === 'DOING').length, color: 'text-blue-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="card text-center">
                    <p className="text-xs text-gray-600 mb-1">{label}</p>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="card">
                  <h3 className="text-sm font-semibold text-white mb-4">By Status</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={statusCounts} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" vertical={false} />
                      <XAxis dataKey="status" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card">
                  <h3 className="text-sm font-semibold text-white mb-4">By Priority</h3>
                  <div className="space-y-3 mt-2">
                    {priorityCounts.map(({ priority, count }) => {
                      const cfg = PRIORITY_CONFIG[priority];
                      const pct = tasks.length ? Math.round((count / tasks.length) * 100) : 0;
                      return (
                        <div key={priority}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className={cfg.color}>{priority}</span>
                            <span className="text-gray-500">{count} tasks</span>
                          </div>
                          <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6 }}
                              className={`h-full rounded-full ${cfg.bg.replace('/10', '')}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div key="notes" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl">
              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white">Project Notes</h3>
                  <span className="text-xs text-gray-600">Auto-saved locally</span>
                </div>
                <textarea
                  className="input resize-none font-mono text-xs leading-relaxed"
                  rows={20}
                  placeholder="Write your project notes, ideas, or documentation here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showTaskForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowTaskForm(false)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleCreateTask}
              className="bg-surface-1 border border-border rounded-2xl w-full max-w-md p-6 shadow-card-hover"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold">New Task</h2>
                <button type="button" onClick={() => setShowTaskForm(false)} className="text-gray-600 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <input className="input" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required autoFocus />
                <textarea className="input resize-none" rows={2} placeholder="Description (optional)" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Status</label>
                    <select className="input" value={defaultStatus} onChange={(e) => setDefaultStatus(e.target.value)}>
                      <option value="TODO">Backlog</option>
                      <option value="DOING">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Priority</label>
                    <select className="input" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Deadline</label>
                  <input type="date" className="input" value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-5">
                <button type="button" onClick={() => setShowTaskForm(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Adding...' : 'Add Task'}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
