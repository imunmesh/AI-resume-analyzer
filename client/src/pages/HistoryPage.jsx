import { useState, useEffect } from 'react';
import { getHistory } from '../services/api';
import HistoryTable from '../components/HistoryTable';
import { HiOutlineClock } from 'react-icons/hi';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getHistory();
        setHistory(Array.isArray(data) ? data : data.data || data.resumes || data.history || []);
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 page-transition">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <HiOutlineClock className="h-5 w-5 text-primary-500" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-dark-900 dark:text-white">
              Analysis History
            </h1>
            <p className="text-sm text-dark-500 dark:text-dark-400">
              All your past resume analyses in one place
            </p>
          </div>
        </div>

        <HistoryTable history={history} loading={loading} />
      </div>
    </div>
  );
}
