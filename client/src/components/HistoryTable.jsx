import { Link } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineChevronRight,
  HiOutlineEye,
  HiOutlineDownload,
} from 'react-icons/hi';
import { downloadResumeFile } from '../services/api';
import toast from 'react-hot-toast';

function ScoreBadge({ score }) {
  if (score == null) return <span className="badge bg-dark-200 dark:bg-dark-800 text-dark-500">Pending</span>;
  if (score >= 80) return <span className="badge-success">{score}/100</span>;
  if (score >= 60) return <span className="badge-warning">{score}/100</span>;
  return <span className="badge-danger">{score}/100</span>;
}

function StatusDot({ status }) {
  const colors = {
    analyzed: 'bg-accent-emerald',
    uploaded: 'bg-accent-amber',
    processing: 'bg-primary-500 animate-pulse',
    failed: 'bg-accent-rose',
  };

  return (
    <span className="flex items-center gap-2 text-xs font-medium capitalize text-dark-600 dark:text-dark-400">
      <span className={`h-2 w-2 rounded-full ${colors[status] || colors.uploaded}`} />
      {status || 'uploaded'}
    </span>
  );
}

export default function HistoryTable({ history = [], loading = false }) {
  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (e, resumeId, fileName) => {
    e.preventDefault();
    e.stopPropagation();
    const loadingToast = toast.loading('Preparing download...');
    try {
      const response = await downloadResumeFile(resumeId);
      const blob = new Blob([response.data], { type: 'text/plain; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const origExt = fileName.substring(fileName.lastIndexOf('.'));
      const safeBaseName = fileName.replace(origExt, '').replace(/[^a-zA-Z0-9-_]/g, '_');
      const downloadName = `${safeBaseName}_extracted.txt`;
      
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started!', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to download resume text.', { id: loadingToast });
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="skeleton h-6 w-48 mb-6" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
                <div className="skeleton h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="h-16 w-16 rounded-2xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center mx-auto mb-4">
          <HiOutlineDocumentText className="h-8 w-8 text-dark-400" />
        </div>
        <h3 className="font-display font-semibold text-dark-900 dark:text-white mb-1">
          No analyses yet
        </h3>
        <p className="text-sm text-dark-500 dark:text-dark-400 mb-4">
          Upload your first resume to get started
        </p>
        <Link to="/dashboard" className="btn-primary text-sm inline-flex items-center gap-2">
          Get Started
          <HiOutlineChevronRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-200/50 dark:border-dark-700/50">
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                Resume
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                Status
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                Size
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                ATS Score
              </th>
              <th className="text-left text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                Date
              </th>
              <th className="text-right text-xs font-semibold uppercase tracking-wider text-dark-500 dark:text-dark-400 px-6 py-4">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-100 dark:divide-dark-800/50">
            {history.map((item) => {
              const fileName = item.file_name || item.fileName || item.originalName || `Resume #${item.id}`;
              const atsScore = item.ats_score !== undefined && item.ats_score !== null 
                ? item.ats_score 
                : (item.atsScore !== undefined && item.atsScore !== null ? item.atsScore : null);
              const date = item.created_at || item.createdAt || item.uploadedAt;
              const status = item.status || (atsScore !== null ? 'analyzed' : 'uploaded');
              const fileSize = item.file_size || item.fileSize;

              return (
                <tr
                  key={item.id}
                  className="group hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                        <HiOutlineDocumentText className="h-5 w-5 text-primary-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-dark-900 dark:text-white truncate max-w-[200px]" title={fileName}>
                          {fileName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusDot status={status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-600 dark:text-dark-400">
                    {formatFileSize(fileSize)}
                  </td>
                  <td className="px-6 py-4">
                    <ScoreBadge score={atsScore} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-sm text-dark-500 dark:text-dark-400">
                      <HiOutlineClock className="h-4 w-4" />
                      {formatDate(date)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => handleDownload(e, item.id, fileName)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-emerald hover:text-emerald-400 transition-colors bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg"
                      title="Download text"
                    >
                      <HiOutlineDownload className="h-4 w-4" />
                      Download
                    </button>
                    <Link
                      to={`/analysis/${item.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:text-primary-400 transition-colors bg-primary-500/10 hover:bg-primary-500/20 px-3 py-1.5 rounded-lg"
                    >
                      <HiOutlineEye className="h-4 w-4" />
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-dark-100 dark:divide-dark-800/50">
        {history.map((item) => {
          const fileName = item.file_name || item.fileName || item.originalName || `Resume #${item.id}`;
          const atsScore = item.ats_score !== undefined && item.ats_score !== null 
            ? item.ats_score 
            : (item.atsScore !== undefined && item.atsScore !== null ? item.atsScore : null);
          const date = item.created_at || item.createdAt || item.uploadedAt;
          const status = item.status || (atsScore !== null ? 'analyzed' : 'uploaded');
          const fileSize = item.file_size || item.fileSize;

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 hover:bg-dark-50 dark:hover:bg-dark-800/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <HiOutlineDocumentText className="h-5 w-5 text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-900 dark:text-white truncate">
                  {fileName}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusDot status={status} />
                  <span className="text-xs text-dark-400">
                    ({formatFileSize(fileSize)})
                  </span>
                  <span className="text-xs text-dark-400">
                    {formatDate(date)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDownload(e, item.id, fileName)}
                  className="p-2 text-accent-emerald hover:bg-emerald-500/10 rounded-lg transition-colors"
                  title="Download text"
                >
                  <HiOutlineDownload className="h-5 w-5" />
                </button>
                <Link to={`/analysis/${item.id}`}>
                  <ScoreBadge score={atsScore} />
                </Link>
                <HiOutlineChevronRight className="h-4 w-4 text-dark-400 flex-shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
