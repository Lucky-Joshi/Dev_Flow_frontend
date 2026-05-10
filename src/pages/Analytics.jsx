import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2, FolderKanban, AlertCircle } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import api from '../services/api';
import Spinner from '../components/ui/Spinner';
import StatCard from '../components/ui/StatCard';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs shadow-card">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-semibold">{payload[0].value}</p>
    </div>
  );
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => {
      setStats(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>;

  const completionRate = stats?.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  // Simulated weekly trend
  const weeklyData = DAYS.map((day) => ({
    day,
    completed: Math.max(0, Math.round((stats?.completedTasks ?? 0) * (0.05 + Math.random() * 0.2))),
    created: Math.max(0, Math.round((stats?.totalTasks ?? 0) * (0.05 + Math.random() * 0.15))),
  }));

  // Monthly trend
  const monthlyData = MONTHS.slice(0, new Date().getMonth() + 1).map((month) => ({
    month,
    tasks: Math.max(0, Math.round((stats?.completedTasks ?? 0) * (0.3 + Math.random() * 0.8))),
  }));

  // Pie data
  const pieData = [
    { name: 'Done',        value: stats?.completedTasks ?? 0 },
    { name: 'In Progress', value: Math.max(0, (stats?.totalTasks ?? 0) - (stats?.completedTasks ?? 0) - (stats?.dueTodayTasks ?? 0)) },
    { name: 'Due Today',   value: stats?.dueTodayTasks ?? 0 },
  ].filter((d) => d.value > 0);

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-4 md:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Analytics</h1>
        <p className="text-xs text-gray-600 mt-0.5">Your productivity overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={FolderKanban} label="Projects"   value={stats?.totalProjects ?? 0} gradient="bg-blue-500"    delay={0} />
        <StatCard icon={CheckCircle2} label="Completed"  value={stats?.completedTasks ?? 0} gradient="bg-emerald-500" delay={0.05} />
        <StatCard icon={AlertCircle}  label="Due Today"  value={stats?.dueTodayTasks ?? 0}  gradient="bg-amber-500"   delay={0.1} />
        <StatCard icon={TrendingUp}   label="Rate"       value={`${completionRate}%`}        gradient="bg-purple-500"  delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Weekly area chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-1">Weekly Trend</h3>
          <p className="text-xs text-gray-600 mb-4">Tasks completed vs created</p>
          <div className="w-full h-40 sm:h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2} fill="url(#completedGrad)" dot={false} />
                <Area type="monotone" dataKey="created" stroke="#10b981" strokeWidth={2} fill="url(#createdGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-0.5 bg-accent rounded" /> Completed
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className="w-3 h-0.5 bg-emerald-500 rounded" /> Created
            </div>
          </div>
        </motion.div>

        {/* Pie chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card flex flex-col">
          <h3 className="text-sm font-semibold text-white mb-4">Task Distribution</h3>
          {pieData.length > 0 ? (
            <>
              <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-gray-500">{d.name}</span>
                    </div>
                    <span className="text-gray-400 font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-gray-600">No task data yet</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Monthly bar chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
        <h3 className="text-sm font-semibold text-white mb-1">Monthly Output</h3>
        <p className="text-xs text-gray-600 mb-4">Tasks completed per month</p>
        <div className="w-full h-40 sm:h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5563', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
