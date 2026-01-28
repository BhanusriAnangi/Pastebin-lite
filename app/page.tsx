'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [result, setResult] = useState<{ url: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? parseInt(ttl) : undefined,
          max_views: maxViews ? parseInt(maxViews) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
      } else {
        setResult(data);
        // Optional: clear form on success
        // setContent('');
        // setTtl('');
        // setMaxViews('');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-white px-8 pt-8 pb-6 border-b border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Pastebin<span className="text-blue-600">Lite</span>
          </h1>
          <p className="mt-2 text-gray-500">
            Share text quickly with optional expiry limits.
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Content Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content
              </label>
              <textarea
                className="w-full p-4 border border-gray-300 rounded-lg h-48 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm text-gray-800 resize-none shadow-sm"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                placeholder="Paste your code or text here..."
              />
            </div>

            {/* Options Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time-to-Live (Seconds)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 shadow-sm"
                    value={ttl}
                    onChange={(e) => setTtl(e.target.value)}
                    placeholder="e.g. 60"
                    min="1"
                  />
                  <span className="absolute right-3 top-3.5 text-xs text-gray-400 font-medium pointer-events-none">
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Views
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800 shadow-sm"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    placeholder="e.g. 5"
                    min="1"
                  />
                  <span className="absolute right-3 top-3.5 text-xs text-gray-400 font-medium pointer-events-none">
             
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold shadow-md transition-all 
                ${loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Paste'
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-pulse">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg shadow-sm">
              <h3 className="text-green-800 font-bold mb-2 flex items-center gap-2">
                <span>✅</span> Paste Created Successfully!
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <input 
                  readOnly 
                  value={result.url} 
                  className="flex-1 p-2 text-sm text-gray-600 bg-white border border-green-200 rounded select-all"
                />
                <a 
                  href={result.url} 
                  target="_blank"
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                >
                  Open Link
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <p className="mt-8 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Pastebin Lite. Content subject to expiry.
      </p>
    </main>
  );
}