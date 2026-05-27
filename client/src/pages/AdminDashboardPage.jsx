import { useState, useEffect } from 'react';
import { getAdminStats, getAdminUsers, getAdminAnalyses, updateUserRole, deleteUser } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineShieldCheck,
} from 'react-icons/hi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#10b981', '#f59e0b', '#f97316', '#f43f5e', '#6366f1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-dark-900 dark:text-white">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, analysesRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAdminAnalyses(),
      ]);
      
      const rawStats = statsRes.data.data || statsRes.data;
      if (rawStats && rawStats.users && rawStats.resumes) {
        setStats({
          totalUsers: rawStats.users.totalUsers,
          totalAnalyses: rawStats.resumes.totalResumes,
          averageScore: rawStats.resumes.averageAtsScore,
          thisWeek: rawStats.resumes.recentResumes,
        });
      } else {
        setStats(rawStats);
      }
      
      const usersData = usersRes.data.data || usersRes.data;
      setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
      
      const analysesData = analysesRes.data.data || analysesRes.data;
      setAnalyses(Array.isArray(analysesData) ? analysesData : analysesData.analyses || []);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to update role');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to delete user');
    }
  };

  // Derived data for charts
  const scoreDistribution = (() => {
    const buckets = [
      { name: '90-100', range: [90, 100], count: 0 },
      { name: '70-89', range: [70, 89], count: 0 },
      { name: '50-69', range: [50, 69], count: 0 },
      { name: '30-49', range: [30, 49], count: 0 },
      { name: '0-29', range: [0, 29], count: 0 },
    ];
    analyses.forEach((a) => {
      const score = a.ats_score !== undefined && a.ats_score !== null
        ? a.ats_score
        : (a.atsScore || a.analysis?.atsScore);
      if (score != null) {
        const bucket = buckets.find((b) => score >= b.range[0] && score <= b.range[1]);
        if (bucket) bucket.count++;
      }
    });
    return buckets;
  })();

  const analysesOverTime = (() => {
    const map = {};
    analyses.forEach((a) => {
      const dateStr = a.created_at || a.createdAt || a.analyzedAt;
      const date = new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[date] = (map[date] || 0) + 1;
    });
    return Object.entries(map)
      .slice(-14)
      .map(([date, count]) => ({ date, count }));
  })();

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || users.length,
      icon: HiOutlineUsers,
      color: 'text-primary-500',
      bg: 'bg-primary-100 dark:bg-primary-900/30',
    },
    {
      label: 'Total Analyses',
      value: stats?.totalAnalyses || analyses.length,
      icon: HiOutlineDocumentText,
      color: 'text-accent-emerald',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      label: 'Avg ATS Score',
      value: stats?.averageScore || (analyses.length ? Math.round(
        analyses.reduce((s, a) => s + (a.atsScore || a.analysis?.atsScore || 0), 0) / analyses.filter((a) => a.atsScore || a.analysis?.atsScore).length
      ) : 0),
      icon: HiOutlineChartBar,
      color: 'text-accent-amber',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      label: 'This Week',
      value: stats?.thisWeek || '—',
      icon: HiOutlineTrendingUp,
      color: 'text-accent-cyan',
      bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'analyses', label: 'Analyses' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 page-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <HiOutlineShieldCheck className="h-5 w-5 text-accent-amber" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-dark-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-dark-500 dark:text-dark-400">
                Manage users, view analytics, and monitor the platform
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="glass card-glow rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-dark-900 dark:text-white">
                    {value}
                  </p>
                  <p className="text-xs text-dark-500 dark:text-dark-400">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 glass rounded-xl w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── Overview Tab ─── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Analyses over time */}
            <div className="glass card-glow rounded-2xl p-6">
              <h3 className="font-display font-semibold text-dark-900 dark:text-white mb-4">
                Analyses Over Time
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Analyses" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score distribution */}
            <div className="glass card-glow rounded-2xl p-6">
              <h3 className="font-display font-semibold text-dark-900 dark:text-white mb-4">
                Score Distribution
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoreDistribution.filter((d) => d.count > 0)}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={4}
                      label={({ name, count }) => `${name}: ${count}`}
                    >
                      {scoreDistribution
                        .filter((d) => d.count > 0)
                        .map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      formatter={(value) => (
                        <span className="text-xs text-dark-500 dark:text-dark-400">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ─── Users Tab ─── */}
        {tab === 'users' && (
          <div className="glass rounded-2xl overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-dark-200/50 dark:border-dark-700/50">
              <div className="relative max-w-md">
                <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users..."
                  className="input-field pl-12"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-200/50 dark:border-dark-700/50">
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                      User
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                      Email
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                      Role
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                      Joined
                    </th>
                    <th className="text-right text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-800/50">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center text-white font-semibold text-sm">
                            {(u.name || u.displayName || u.email)?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="text-sm font-medium text-dark-900 dark:text-white">
                            {u.name || u.displayName || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-600 dark:text-dark-400">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.role || 'user'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer ${
                            u.role === 'admin'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                              : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-500 dark:text-dark-400">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-2 text-dark-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          title="Delete user"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-dark-500 dark:text-dark-400 text-sm">
                  No users found matching "{search}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Analyses Tab ─── */}
        {tab === 'analyses' && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-200/50 dark:border-dark-700/50">
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                      User
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                      Resume
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                      ATS Score
                    </th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-800/50">
                  {analyses.map((a, i) => {
                    const score = a.ats_score !== undefined && a.ats_score !== null
                      ? a.ats_score
                      : (a.atsScore || a.analysis?.atsScore);
                    const userName = a.user_name || a.userName || a.user?.name || a.user?.email || '—';
                    const fileName = a.file_name || a.fileName || a.originalName || `#${a.resumeId || a.id}`;
                    const dateVal = a.created_at || a.createdAt;
                    return (
                      <tr
                        key={a.id || i}
                        className="hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-dark-700 dark:text-dark-300">
                          {userName}
                        </td>
                        <td className="px-6 py-4 text-sm text-dark-700 dark:text-dark-300">
                          {fileName}
                        </td>
                        <td className="px-6 py-4">
                          {score != null ? (
                            <span
                              className={`badge ${
                                score >= 80
                                  ? 'badge-success'
                                  : score >= 60
                                  ? 'badge-warning'
                                  : 'badge-danger'
                              }`}
                            >
                              {score}/100
                            </span>
                          ) : (
                            <span className="badge bg-dark-200 dark:bg-dark-800 text-dark-500">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-dark-500 dark:text-dark-400">
                          {dateVal
                            ? new Date(dateVal).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {analyses.length === 0 && (
                <div className="text-center py-12 text-dark-500 dark:text-dark-400 text-sm">
                  No analyses found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
