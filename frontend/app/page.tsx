"use client";
import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

export default function Home() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Other',
    submitterName: '',
    submitterEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.description.length < 20) {
      alert("Description must be at least 20 characters");
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:4000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsError(false);
        setMessage("✅ Feedback submitted! AI is analyzing it now.");
        setForm({ title: '', description: '', category: 'Other', submitterName: '', submitterEmail: '' });
      } else {
        const data = await res.json();
        setIsError(true);
        setMessage(`❌ Error: ${data.message || 'Something went wrong'}`);
      }
    } catch (err) {
      setIsError(true);
      setMessage("❌ Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 mt-10">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-indigo-700">
          <MessageSquare className="text-indigo-500" /> FeedPulse
        </h1>
        <p className="text-gray-500 mb-6 text-sm">Share your feedback and let AI help prioritize it.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              required
              maxLength={120}
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Short title of your feedback"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="Bug">Bug</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Improvement">Improvement</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <span className={`text-xs font-semibold ${form.description.length < 20 ? 'text-red-500' : 'text-green-500'}`}>
                {form.description.length} / 20 min chars
              </span>
            </div>
            <textarea
              required
              rows={4}
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell us more (minimum 20 characters)..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (optional)</label>
            <input
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900"
              value={form.submitterName}
              onChange={(e) => setForm({ ...form, submitterName: e.target.value })}
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Email (optional)</label>
            <input
              type="email"
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-900"
              value={form.submitterEmail}
              onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })}
              placeholder="jane@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading || form.description.length < 20}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
          >
            <Send size={18} /> {loading ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm font-semibold p-3 rounded-lg ${isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </p>
        )}

        <p className="text-center mt-6 text-xs text-gray-400">
          Are you an admin? <a href="/dashboard" className="text-indigo-500 underline">Go to Dashboard →</a>
        </p>
      </div>
    </main>
  );
}