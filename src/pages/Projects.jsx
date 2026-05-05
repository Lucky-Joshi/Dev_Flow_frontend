import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useProjectStore from '../store/projectStore';

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
    if (!confirm('Delete this project and all its tasks?')) return;
    await deleteProject(id);
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-3">
          <h2 className="text-sm font-semibold text-white">New Project</h2>
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
            rows={2}
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-gray-500">No projects yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="card hover:border-accent/50 transition-colors group block"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-white font-medium group-hover:text-accent transition-colors">
                  {project.name}
                </h3>
                <button
                  onClick={(e) => handleDelete(e, project.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none ml-2"
                >
                  &times;
                </button>
              </div>
              {project.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
              )}
              <p className="text-xs text-gray-600">
                {project._count?.tasks ?? 0} tasks &middot; {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
