import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Flag, Filter } from 'lucide-react';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import TaskModal from '../components/TaskModal';
import useTaskStore from '../store/taskStore';

const PRIORITY_CONFIG = {
  LOW:    { color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  MEDIUM: { color: 'text-amber-400',   bg: 'bg-amber-400/10',   dot: 'bg-amber-400' },
  HIGH:   { color: 'text-red-400',     bg: 'bg-red-400/10',     dot: 'bg-red-400' },
};

const STATUS_CONFIG = {
  TODO:  { label: 'Backlog',      color: 'text-gray-400',    bg: 'bg-gray-400/10',    icon: Circle },
  DOING: { label: 'In Progress',  color: 'text-blue-400',    bg: 'bg-blue-400/10',    icon: Clock },
  DONE:  { label: 'Done',         color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle2 },
};

export default function Tasks() {
  const { tasks, updateTask, deleteTask } = useTaskStore();
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    api.get('/tasks').then(({ data }) => {
      setAllTasks(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? allTasks : allTasks.filter((t) => t.status === filter);

  const handleUpdate = async (id, updates) => {
    await updateTask(id, updates);
    setAllTasks((prev) => prev.map((t) => t.id === id ? { ...t, ...updates } : t));
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setAllTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">All Tasks</h1>
          <p className="text-xs text-gray-600 mt-0.5">{allTasks.length} tasks across all projects</p>
        </div>
        <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'TODO', 'DOING', 'DONE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                filter === f ? 'bg-accent text-white' : 'text-gray-500 hover:text-white'
              }`}
            >
              {f === 'ALL' ? 'All' : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="No tasks" description="Tasks from all your projects appear here" />
      ) : (
        <div className="space-y-1">
          {filtered.map((task, i) => {
            const p = PRIORITY_CONFIG[task.priority];
            const s = STATUS_CONFIG[task.status];
            const StatusIcon = s.icon;
            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE';

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedTask(task)}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer group border border-transparent hover:border-border"
              >
                <StatusIcon size={15} className={`${s.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0 w-full">
                  <p className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-gray-600' : 'text-white'}`}>
                    {task.title}
                  </p>
                  {task.project?.name && (
                    <p className="text-xs text-gray-600 mt-0.5">{task.project.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto flex-wrap">
                  {task.deadline && (
                    <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-gray-600'}`}>
                      {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                  <span className={`badge ${p.bg} ${p.color}`}>
                    <Flag size={9} /> {task.priority}
                  </span>
                  <span className={`badge ${s.bg} ${s.color}`}>{s.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
