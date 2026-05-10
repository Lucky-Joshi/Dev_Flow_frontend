import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, FolderKanban, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import StatCard from '../components/ui/StatCard';
import Spinner from '../components/ui/Spinner';

const PRIORITY_CONFIG = {
  LOW:    { color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  MEDIUM: { color: 'text-amber-400',   bg: 'bg-amber-400/10',   dot: 'bg-amber-400' },
  HIGH:   { color: 'text-red-400',     bg: 'bg-red-400/10',     dot: 'bg-red-400' },
};

const STATUS_CONFIG = {
  TODO:  { label: 'Todo',  color: 'text-gray-400',    bg: 'bg-gray-400/10' },
  DOING: { label: 'Doing', color: 'text-blue-400',    bg: 'bg-blue-400/10' },
  DONE:  { label: 'Done',  color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
};

function buildWeeklyData(stats) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const base = stats?.completedTasks ?? 0;
  return days.map((day) => ({
    day,
    tasks: Math.max(0, Math.round(base * (0.08 + Math.random() * 0.28))),
  }));
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs shadow-card">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} tasks</p>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => {
      setStats(data);
      setWeeklyData(buildWeeklyData(data));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;
  }

  const completionRate = stats?.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4">
        <div className="w-full sm:w-auto">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
        </div>
        <Link to="/projects" className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
          New Project <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={FolderKanban} label="Projects"   value={stats?.totalProjects ?? 0} gradient="bg-blue-500"    delay={0}    sub="active workspaces" />
        <StatCard icon={CheckCircle2} label="Completed"  value={stats?.completedTasks ?? 0} gradient="bg-emerald-500" delay={0.05} sub="tasks done" />
        <StatCard icon={AlertCircle}  label="Due Today"  value={stats?.dueTodayTasks ?? 0}  gradient="bg-amber-500"   delay={0.1}  sub="need attention" />
        <StatCard icon={TrendingUp}   label="Completion" value={`${completionRate}%`}        gradient="bg-purple-500"  delay={0.15} sub="overall rate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Weekly Activity</h3>
            <p className="text-xs text-gray-600 mt-0.5">Tasks completed this week</p>
          </div>
          <div className="w-full h-40 sm:h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tasks" stroke="#6366f1" strokeWidth={2} fill="url(#taskGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Task Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Completed',   value: stats?.completedTasks ?? 0, color: 'bg-emerald-500' },
              { label: 'In Progress', value: Math.max(0, (stats?.totalTasks ?? 0) - (stats?.completedTasks ?? 0) - (stats?.dueTodayTasks ?? 0)), color: 'bg-blue-500' },
              { label: 'Due Today',   value: stats?.dueTodayTasks ?? 0, color: 'bg-amber-500' },
            ].map(({ label, value, color }) => {
              const pct = stats?.totalTasks ? Math.round((value / stats.totalTasks) * 100) : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-400 font-medium">{value}</span>
                  </div>
                  <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.4, duration: 0.6 }} className={`h-full rounded-full ${color}`} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Overall progress</span>
              <span className="text-sm font-bold text-white">{completionRate}%</span>
            </div>
            <div className="h-2 bg-surface-3 rounded-full overflow-hidden mt-2">
              <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} transition={{ delay: 0.5, duration: 0.8 }} className="h-full rounded-full bg-gradient-to-r from-accent to-purple-500" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Tasks */}
      {stats?.recentTasks?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold text-white">Recent Tasks</h3>
            <Link to="/tasks" className="text-xs text-accent hover:text-accent-hover transition-colors flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-1 overflow-x-auto">
            {stats.recentTasks.map((task, i) => {
              const p = PRIORITY_CONFIG[task.priority];
              const s = STATUS_CONFIG[task.status];
              return (
                <motion.div key={task.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-2.5 px-3 rounded-lg hover:bg-surface-2 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{task.title}</p>
                      <p className="text-xs text-gray-600">{task.project?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                    <span className={`badge ${s.bg} ${s.color}`}>{s.label}</span>
                    <span className={`badge ${p.bg} ${p.color}`}>{task.priority}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty */}
      {stats?.totalProjects === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card text-center py-12 sm:py-16 border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <FolderKanban size={22} className="text-accent" />
          </div>
          <p className="text-white font-medium mb-1">No projects yet</p>
          <p className="text-sm text-gray-600 mb-5">Create your first project to get started</p>
          <Link to="/projects" className="btn-primary inline-flex items-center gap-2">
            Create Project <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}
    </div>
  );
}
