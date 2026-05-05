import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/authStore';

const PRIORITY_COLORS = {
  LOW: 'text-green-400',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-red-400',
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Good morning, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 text-sm mt-1">Here's what's happening today</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Projects', value: stats.totalProjects, color: 'text-blue-400' },
          { label: 'Total Tasks', value: stats.totalTasks, color: 'text-purple-400' },
          { label: 'Completed', value: stats.completedTasks, color: 'text-green-400' },
          { label: 'Due Today', value: stats.dueTodayTasks, color: 'text-yellow-400' },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {stats.recentTasks.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats.recentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-white">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.project.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className="text-xs text-gray-600 bg-surface-2 px-2 py-0.5 rounded-full">
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.totalProjects === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No projects yet. Create your first one.</p>
          <Link to="/projects" className="btn-primary inline-block">
            Create Project
          </Link>
        </div>
      )}
    </div>
  );
}
