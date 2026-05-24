import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, Clock, Zap, RefreshCw, ExternalLink, AlertTriangle, Loader2, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WebhookEvent {
  id: string;
  timestamp: string;
  eventType: string;
  action: string;
  repoFullName: string;
  prNumber: number | null;
  prTitle: string;
  prAuthor: string;
  status: 'processing' | 'success' | 'failed' | 'ignored';
  message: string;
  commentUrl?: string;
  durationMs?: number;
}

interface Stats {
  total: number;
  successful: number;
  failed: number;
  ignored: number;
  processing: number;
  avgDurationMs: number;
  docsGenerated: number;
  lastEvent: string | null;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const statusConfig = {
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.2)]', label: 'Success' },
  failed: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', glow: 'shadow-[0_0_15px_rgba(251,113,133,0.2)]', label: 'Failed' },
  processing: { icon: Loader2, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.2)]', label: 'Processing' },
  ignored: { icon: Eye, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', glow: '', label: 'Ignored' },
};

export default function WebhookDashboard() {
  const [activity, setActivity] = useState<WebhookEvent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = async () => {
    try {
      const [actRes, statsRes] = await Promise.all([
        fetch('/api/webhook/activity'),
        fetch('/api/webhook/stats')
      ]);
      const actData = await actRes.json();
      const statsData = await statsRes.json();
      setActivity(actData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch webhook data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="font-medium">Establishing connection...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Webhook Activity</h2>
          <p className="text-slate-400 mt-2 text-sm max-w-lg">Real-time monitoring of autonomous pull request documentation events.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all duration-300 border ${
              autoRefresh
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-slate-500'}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={fetchData}
            className="glass-panel border-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/10 hover:shadow-lg transition-all duration-300 text-sm font-medium flex items-center gap-2 group"
          >
            <RefreshCw className="w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Events"
            value={stats.total}
            icon={<Activity />}
            glowColor="rgba(99,102,241,0.5)"
            accentClass="text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
          />
          <StatCard
            label="Successful"
            value={stats.successful}
            icon={<CheckCircle2 />}
            glowColor="rgba(52,211,153,0.5)"
            accentClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            subtitle={stats.total > 0 ? `${Math.round((stats.successful / Math.max(stats.total - stats.ignored, 1)) * 100)}% success rate` : undefined}
          />
          <StatCard
            label="Avg. Duration"
            value={stats.avgDurationMs > 0 ? `${(stats.avgDurationMs / 1000).toFixed(1)}s` : '—'}
            icon={<Clock />}
            glowColor="rgba(245,158,11,0.5)"
            accentClass="text-amber-400 bg-amber-500/10 border-amber-500/20"
          />
          <StatCard
            label="Docs Generated"
            value={stats.docsGenerated}
            icon={<Zap />}
            glowColor="rgba(167,139,250,0.5)"
            accentClass="text-violet-400 bg-violet-500/10 border-violet-500/20"
            subtitle={stats.lastEvent ? `Last: ${timeAgo(stats.lastEvent)}` : undefined}
          />
        </div>
      )}

      {/* Activity Feed */}
      <div className="glass-panel rounded-2xl shadow-xl overflow-hidden border-white/5">
        <div className="px-6 py-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200 text-sm tracking-wide uppercase">Event Stream</h3>
          <span className="text-xs font-medium text-slate-400 bg-black/20 px-2 py-1 rounded-md border border-white/5">
            {activity.length} events logged
          </span>
        </div>

        {activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-slate-400">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
              <Activity className="w-10 h-10 text-slate-500" />
            </div>
            <p className="font-medium text-lg text-slate-300">Listening for Webhooks...</p>
            <p className="text-sm mt-2 max-w-md text-center leading-relaxed">
              Open a Pull Request on your connected GitHub repository and watch the events stream in live.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar bg-black/20">
            <AnimatePresence>
              {activity.map((event, i) => {
                const config = statusConfig[event.status];
                const StatusIcon = config.icon;
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-6 py-5 flex items-start gap-5 hover:bg-white/5 transition-colors group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center shrink-0 shadow-inner ${config.glow}`}>
                      <StatusIcon className={`w-5 h-5 ${config.color} ${event.status === 'processing' ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bg} ${config.color} ${config.border}`}>
                          {config.label}
                        </span>
                        {event.prNumber && (
                          <span className="text-xs text-indigo-300 font-mono bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                            PR #{event.prNumber}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-medium">{timeAgo(event.timestamp)}</span>
                        {event.durationMs && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {(event.durationMs / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-200 font-medium truncate mb-1">{event.message}</p>
                      <p className="text-xs text-slate-400 truncate flex items-center gap-2">
                        <span className="text-indigo-400">{event.repoFullName}</span>
                        {event.prAuthor && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                            <span className="flex items-center gap-1">
                              <img src={`https://github.com/${event.prAuthor}.png?size=24`} alt={event.prAuthor} className="w-4 h-4 rounded-full" />
                              {event.prAuthor}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    {event.commentUrl && (
                      <a
                        href={event.commentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all shadow-sm shrink-0 mt-1 opacity-0 group-hover:opacity-100"
                        title="View comment on GitHub"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accentClass,
  glowColor,
  subtitle
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accentClass: string;
  glowColor: string;
  subtitle?: string;
}) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="glass-panel rounded-2xl p-6 border-white/5 relative overflow-hidden group"
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40`} style={{ background: glowColor }}></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-sm text-slate-400 font-medium tracking-wide">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${accentClass}`}>
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
            className: "w-5 h-5"
          })}
        </div>
      </div>
      <p className="text-3xl font-bold text-white relative z-10">{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-2 relative z-10 font-medium">{subtitle}</p>}
    </motion.div>
  );
}
