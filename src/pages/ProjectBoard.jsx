import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useProjectStore from '../store/projectStore';
import useTaskStore from '../store/taskStore';
import KanbanBoard from '../components/KanbanBoard';

export default function ProjectBoard() {
  const { id } = useParams();
  const { fetchProject, currentProject, updateProject } = useProjectStore();
  const { fetchTasks, createTask } = useTaskStore();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    deadline: '',
    status: 'TODO',
  });
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [projectName, setProjectName] = useState('');

  useEffect(() => {
    fetchProject(id);
    fetchTasks(id);
  }, [id]);

  useEffect(() => {
    if (currentProject) setProjectName(currentProject.name);
  }, [currentProject]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    await createTask({ ...taskForm, projectId: id });
    setTaskForm({ title: '', description: '', priority: 'MEDIUM', deadline: '', status: 'TODO' });
    setShowTaskForm(false);
    setSaving(false);
  };

  const handleRenameProject = async () => {
    if (projectName.trim() && projectName !== currentProject?.name) {
      await updateProject(id, { name: projectName });
    }
    setEditingName(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/projects" className="text-gray-500 hover:text-white text-sm transition-colors">
            Projects
          </Link>
          <span className="text-gray-600">/</span>
          {editingName ? (
            <input
              className="input text-lg font-bold py-1 px-2 w-64"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={handleRenameProject}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameProject()}
              autoFocus
            />
          ) : (
            <h1
              className="text-lg font-bold text-white cursor-pointer hover:text-accent transition-colors"
              onClick={() => setEditingName(true)}
              title="Click to rename"
            >
              {currentProject?.name || '...'}
            </h1>
          )}
        </div>
        <button onClick={() => setShowTaskForm(true)} className="btn-primary">
          + Add Task
        </button>
      </div>

      {showTaskForm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowTaskForm(false)}
        >
          <form onSubmit={handleCreateTask} className="bg-surface-1 border border-border rounded-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-white font-semibold">New Task</h2>
            <input
              className="input"
              placeholder="Task title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
              autoFocus
            />
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Description (optional)"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Status</label>
                <select
                  className="input"
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                >
                  <option value="TODO">Todo</option>
                  <option value="DOING">Doing</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Priority</label>
                <select
                  className="input"
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Deadline</label>
              <input
                type="date"
                className="input"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowTaskForm(false)} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-auto p-6">
        <KanbanBoard projectId={id} />
      </div>
    </div>
  );
}
