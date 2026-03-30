"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, RefreshCw } from 'lucide-react';

interface Feedback {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  submitterName?: string;
  submitterEmail?: string;
  ai_sentiment?: string;
  ai_priority?: number;
  ai_summary?: string;
  ai_tags?: string[];
  ai_processed: boolean;
  createdAt: string;
}

const sentimentColor: Record<string, string> = {
  Positive: 'bg-green-100 text-green-700',
  Neutral: 'bg-yellow-100 text-yellow-700',
  Negative: 'bg-red-100 text-red-700',
};

const statusColor: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  'In Review': 'bg-orange-100 text-orange-700',
  Resolved: 'bg-gray-100 text-gray-600',
};

export default function Dashboard() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchFeedback(token);
  }, []);

  const fetchFeedback = async (token?: string) => {
    const t = token || localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/feedback', {
        headers: { Authorization: `Bearer ${t}` }
      });
      const data = await res.json();
      if (data.success) setFeedback(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    setUpdatingId(id);
    try {
      const res = await fetch(`http://localhost:4000/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(prev => prev.map(f => f._id === id ? { ...f, status } : f));
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:4000/api/feedback/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setFeedback(prev => prev.filter(f => f._id !== id));
  };

  const logout = () => { localStorage.removeItem('token'); router.push('/login'); };

  const filtered = feedback.filter(f => {
    const catOk = categoryFilter === 'All' || f.category === categoryFilter;
    const statOk = statusFilter === 'All' || f.status === statusFilter;
    return catOk && statOk;
  });

  const totalOpen = feedback.filter(f => f.status === 'New').length;
  const avgPriority = feedback.length
    ? (feedback.reduce((s, f) => s + (f.ai_priority || 0), 0) / feedback.length).toFixed(1)
    : '—';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🎯 FeedPulse — Admin Dashboard</h1>
        <button onClick={logout} className="flex items-center gap-1 text-sm bg-indigo-800 px-3 py-1.5 rounded hover:bg-indigo-900">
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-indigo-600">{feedback.length}</p>
            <p className="text-gray-500 text-sm">Total Feedback</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-blue-600">{totalOpen}</p>
            <p className="text-gray-500 text-sm">Open Items</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-orange-500">{avgPriority}</p>
            <p className="text-gray-500 text-sm">Avg AI Priority</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-gray-600">Filter by Category:</span>
          {['All', 'Bug', 'Feature Request', 'Improvement', 'Other'].map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${categoryFilter === c ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:border-indigo-400'}`}>
              {c}
            </button>
          ))}
          <span className="text-sm font-medium text-gray-600 ml-4">Status:</span>
          {['All', 'New', 'In Review', 'Resolved'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${statusFilter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:border-indigo-400'}`}>
              {s}
            </button>
          ))}
          <button onClick={() => fetchFeedback()} className="ml-auto flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Feedback Cards */}
        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading feedback...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No feedback found.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map(f => (
              <div key={f._id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg">{f.title}</h3>
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{f.category}</span>
                      {f.ai_sentiment && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sentimentColor[f.ai_sentiment] || 'bg-gray-100 text-gray-600'}`}>
                          {f.ai_sentiment}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[f.status] || 'bg-gray-100'}`}>
                        {f.status}
                      </span>
                      {f.ai_priority && (
                        <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                          Priority: {f.ai_priority}/10
                        </span>
                      )}
                    </div>

                    {f.ai_summary && (
                      <p className="text-sm text-gray-600 mb-2">🤖 <span className="font-medium">AI Summary:</span> {f.ai_summary}</p>
                    )}

                    {f.ai_tags && f.ai_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {f.ai_tags.map(tag => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-400">
                      {f.submitterName && `By ${f.submitterName} · `}
                      {new Date(f.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <select
                      value={f.status}
                      disabled={updatingId === f._id}
                      onChange={(e) => updateStatus(f._id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option>New</option>
                      <option>In Review</option>
                      <option>Resolved</option>
                    </select>
                    <button
                      onClick={() => deleteFeedback(f._id)}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg p-1.5 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}