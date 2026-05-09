import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderKanban, Trash2, ArrowRight, X } from 'lucide-react';
import useProjectStore from '../store/projectStore';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const PROJECT_COLORS = [
  'from-blue-500/20 to-blue-600/5',
  'from-purple-500/20 to-purple-600/5',
  'from-emerald-500/20 to-emerald-600/5',
  'from-amber-500/20 to-amber-600/5',
  'from-pink-500/20 to-pink-600/5',
  'from-cyan-500/20 to-cyan-600/5',
];

const DOT_COLORS = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500', 'bg-cyan-500'];

export default function Projects() {
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjectStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await createProject(form.name, form.description);
    setForm({ name: '', description: '' });
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this project and all its tasks?')) return;
    await deleteProject(id);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Projects</h1>
          <p className="text-xs text-gray-600 mt-0.5">{projects.length} workspace{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> New Project
        </button>
      </div>

      {/* Create form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          >
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleCreate}
              className="bg-surface-1 border border-border rounded-2xl w-full max-w-md p-6 shadow-card-hover"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white font-semibold">New Project</h2>
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-600 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  className="input"
                  placeholder="Project name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                />
                <textarea
                  className="input resize-none"
                  rows={3}
                  placeholder="Description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end mt-5">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to start organizing your work"
          action={
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 mx-auto">
              <Plus size={14} /> Create Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const grad = PROJECT_COLORS[i % PROJECT_COLORS.length];
            const dot = DOT_COLORS[i % DOT_COLORS.length];
            const taskCount = project._count?.tasks ?? 0;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/projects/${project.id}`}
                  className={`card-hover block bg-gradient-to-br ${grad} group relative`}
                >
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center
                               text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all
                               opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${dot}`} />
                    <span className="text-xs text-gray-600 font-mono">
                      {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold mb-1 group-hover:text-accent transition-colors pr-8">
                    {project.name}
                  </h3>

                  {project.description && (
                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                    <span className="text-xs text-gray-600">{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
                    <ArrowRight size={14} className="text-gray-600 group-hover:text-accent transition-colors group-hover:translate-x-0.5 transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
