import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle, Clock, Zap, RefreshCw, ExternalLink, AlertTriangle, Loader2, Eye } from 'lucide-react';

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
  success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Success' },
  failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Failed' },
  processing: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Processing' },
  ignored: { icon: Eye, color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200', label: 'Ignored' },
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
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white border border-slate-200 rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500 font-medium">Loading webhook activity...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-medium text-slate-800">Webhook Activity</h2>
          <p className="text-slate-500 mt-1">Real-time monitoring of autonomous PR documentation events.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors border ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>
          <button
            onClick={fetchData}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Events"
            value={stats.total}
            icon={<Activity className="w-5 h-5" />}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            label="Successful"
            value={stats.successful}
            icon={<CheckCircle2 className="w-5 h-5" />}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
            subtitle={stats.total > 0 ? `${Math.round((stats.successful / Math.max(stats.total - stats.ignored, 1)) * 100)}% success rate` : undefined}
          />
          <StatCard
            label="Avg. Duration"
            value={stats.avgDurationMs > 0 ? `${(stats.avgDurationMs / 1000).toFixed(1)}s` : '—'}
            icon={<Clock className="w-5 h-5" />}
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
          <StatCard
            label="Docs Generated"
            value={stats.docsGenerated}
            icon={<Zap className="w-5 h-5" />}
            color="text-violet-600"
            bgColor="bg-violet-50"
            subtitle={stats.lastEvent ? `Last: ${timeAgo(stats.lastEvent)}` : undefined}
          />
        </div>
      )}

      {/* Activity Feed */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-medium text-slate-800 text-sm">Event Log</h3>
          <span className="text-xs text-slate-400">{activity.length} events</span>
        </div>

        {activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-slate-400">
            <Activity className="w-12 h-12 mb-4 opacity-30" />
            <p className="font-medium">No webhook events yet</p>
            <p className="text-sm mt-2 max-w-sm text-center">
              Events will appear here when GitHub sends webhook notifications for Pull Requests.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {activity.map((event) => {
              const config = statusConfig[event.status];
              const StatusIcon = config.icon;
              return (
                <div key={event.id} className={`px-6 py-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors`}>
                  <div className={`w-8 h-8 rounded-full ${config.bg} ${config.border} border flex items-center justify-center shrink-0 mt-0.5`}>
                    <StatusIcon className={`w-4 h-4 ${config.color} ${event.status === 'processing' ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      {event.prNumber && (
                        <span className="text-xs text-slate-500 font-mono">PR #{event.prNumber}</span>
                      )}
                      <span className="text-xs text-slate-400">{timeAgo(event.timestamp)}</span>
                      {event.durationMs && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(event.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-800 font-medium truncate">{event.message}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {event.repoFullName}
                      {event.prAuthor && ` · @${event.prAuthor}`}
                    </p>
                  </div>
                  {event.commentUrl && (
                    <a
                      href={event.commentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-700 shrink-0 mt-1"
                      title="View comment on GitHub"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}
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
  color,
  bgColor,
  subtitle
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
            className: `w-4 h-4 ${color}`
          })}
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
