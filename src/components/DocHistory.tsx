import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { History, ExternalLink, RefreshCw, Loader2, FileText, ChevronDown, ChevronUp, GitPullRequest, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="font-medium">Loading documentation history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Documentation History</h2>
          <p className="text-slate-400 mt-2 text-sm max-w-lg">Browse all AI-generated documentation from past Pull Requests.</p>
        </div>
        <button
          onClick={fetchHistory}
          className="glass-panel border-white/10 text-white px-5 py-2.5 rounded-xl hover:bg-white/10 hover:shadow-lg transition-all duration-300 text-sm font-medium flex items-center gap-2 group"
        >
          <RefreshCw className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
          Refresh
        </button>
      </div>

      {history.length === 0 ? (
        <div className="glass-panel rounded-2xl shadow-xl flex flex-col items-center justify-center p-20 text-slate-400 border-white/5">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
            <History className="w-10 h-10 text-slate-500" />
          </div>
          <p className="font-medium text-lg text-slate-300">No documentation generated yet</p>
          <p className="text-sm mt-2 max-w-md text-center leading-relaxed">
            Documentation entries will appear here after DocSync processes Pull Request webhooks.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {history.map((entry, i) => {
              const isExpanded = expandedId === entry.id;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={entry.id} 
                  className="glass-panel border-white/5 rounded-2xl shadow-lg overflow-hidden group"
                >
                  {/* Header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full px-6 py-5 flex items-center gap-5 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 shadow-[0_0_15px_rgba(167,139,250,0.15)] flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-base font-semibold text-slate-200 truncate group-hover:text-white transition-colors">{entry.prTitle}</span>
                        <span className="text-xs text-indigo-300 font-mono shrink-0 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">PR #{entry.prNumber}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 text-indigo-300/80">
                          <GitPullRequest className="w-3.5 h-3.5" />
                          {entry.repoFullName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          @{entry.prAuthor}
                        </span>
                        <span className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 pl-4">
                      <a
                        href={entry.commentUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all shadow-sm"
                        title="View on GitHub"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <div className="w-8 h-8 flex items-center justify-center text-slate-500">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expandable Documentation Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-white/10 overflow-hidden bg-black/20"
                      >
                        <div className="px-8 py-3 bg-white/5 flex items-center justify-between border-b border-white/5">
                          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Generated Documentation</span>
                          <a
                            href={entry.commentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                          >
                            View on GitHub <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="px-8 py-8 prose prose-sm prose-invert prose-slate prose-a:text-indigo-400 prose-headings:text-slate-200 max-w-none max-h-[600px] overflow-y-auto custom-scrollbar">
                          <ReactMarkdown>{entry.documentation}</ReactMarkdown>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
