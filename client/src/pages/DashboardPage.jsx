import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHistory } from '../services/api';
import UploadResume from '../components/UploadResume';
import HistoryTable from '../components/HistoryTable';
import {
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineLightningBolt,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const { data } = await getHistory();
      setHistory(Array.isArray(data) ? data : data.data || data.resumes || data.history || []);
    } catch {
      // Silently fail – table will show empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUploadComplete = (data) => {
    fetchHistory();
    const resumeId = data?.data?.id || data?.id;
    if (resumeId) {
      toast.success('Upload complete! Redirecting to analysis...');
      navigate(`/analysis/${resumeId}`);
    } else {
      toast.success('Upload complete!');
    }
  };

  // Quick stats
  const totalUploads = history.length;
  const analyzedCount = history.filter(
    (h) => h.ats_score != null || h.atsScore != null || h.analysis?.atsScore != null
  ).length;
  const avgScore =
    analyzedCount > 0
      ? Math.round(
          history.reduce(
            (sum, h) =>
              sum +
              (h.ats_score != null
                ? h.ats_score
                : h.atsScore || h.analysis?.atsScore || 0),
            0
          ) / analyzedCount
        )
      : 0;

  return (
    <div className="min-h-screen pt-24 pb-12 page-transition">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-dark-900 dark:text-white">
            Welcome back, <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'there'}</span>
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mt-1">
            Upload and analyze your resumes to improve your job search
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              label: 'Total Uploads',
              value: totalUploads,
              icon: HiOutlineDocumentText,
              color: 'text-primary-500',
              bg: 'bg-primary-100 dark:bg-primary-900/30',
            },
            {
              label: 'Analyzed',
              value: analyzedCount,
              icon: HiOutlineChartBar,
              color: 'text-accent-emerald',
              bg: 'bg-emerald-100 dark:bg-emerald-900/30',
            },
            {
              label: 'Avg ATS Score',
              value: avgScore || '—',
              icon: HiOutlineLightningBolt,
              color: 'text-accent-amber',
              bg: 'bg-amber-100 dark:bg-amber-900/30',
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="glass card-glow rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`h-12 w-12 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-dark-900 dark:text-white">
                  {value}
                </p>
                <p className="text-xs text-dark-500 dark:text-dark-400">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Upload section */}
          <div className="lg:col-span-2">
            <div className="glass card-glow rounded-2xl p-6">
              <h2 className="font-display font-semibold text-lg text-dark-900 dark:text-white mb-4">
                Upload Resume
              </h2>
              <UploadResume onUploadComplete={handleUploadComplete} />
            </div>
          </div>

          {/* Recent analyses */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-dark-900 dark:text-white">
                Recent Analyses
              </h2>
              {history.length > 0 && (
                <Link
                  to="/history"
                  className="text-sm font-medium text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-1"
                >
                  View All
                  <HiOutlineArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <HistoryTable history={history.slice(0, 5)} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
