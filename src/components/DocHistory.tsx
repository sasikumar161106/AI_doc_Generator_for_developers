import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { History, ExternalLink, RefreshCw, Loader2, FileText, ChevronDown, ChevronUp, GitPullRequest, User } from 'lucide-react';

interface DocHistoryEntry {
  id: string;
  timestamp: string;
  repoFullName: string;
  prNumber: number;
  prTitle: string;
  prAuthor: string;
  documentation: string;
  commentUrl: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function DocHistory() {
  const [history, setHistory] = useState<DocHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webhook/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500 font-medium">Loading documentation history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-medium text-slate-800">Documentation History</h2>
          <p className="text-slate-500 mt-1">Browse all AI-generated documentation from past Pull Requests.</p>
        </div>
        <button
          onClick={fetchHistory}
          className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {history.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center p-16 text-slate-400">
          <History className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-medium">No documentation generated yet</p>
          <p className="text-sm mt-2 max-w-sm text-center">
            Documentation entries will appear here after DocSync processes Pull Request webhooks.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-slate-800 truncate">{entry.prTitle}</span>
                      <span className="text-xs text-slate-400 font-mono shrink-0">PR #{entry.prNumber}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <GitPullRequest className="w-3 h-3" />
                        {entry.repoFullName}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        @{entry.prAuthor}
                      </span>
                      <span>{formatDate(entry.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={entry.commentUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-500 hover:text-blue-700 p-1"
                      title="View on GitHub"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expandable Documentation Content */}
                {isExpanded && (
                  <div className="border-t border-slate-200">
                    <div className="px-6 py-2 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Generated Documentation</span>
                      <a
                        href={entry.commentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                      >
                        View on GitHub <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="px-6 py-6 prose prose-sm prose-slate max-w-none max-h-[500px] overflow-y-auto">
                      <ReactMarkdown>{entry.documentation}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
