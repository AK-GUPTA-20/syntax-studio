import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Terminal,
  Server,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function AdminAuditLogs({ auditLogs = [], healthData, onRefresh, loading }) {
  const [filterType, setFilterType] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Event type filter
      if (filterType === 'AUTH' && !log.eventType?.startsWith('AUTH_')) return false;
      if (filterType === 'SECURITY' && !['SECURITY_VIOLATION', 'CSRF_VIOLATION', 'RATE_LIMIT_HIT', 'SSRF_ATTEMPT_BLOCKED', 'ACCESS_DENIED'].includes(log.eventType)) return false;
      if (filterType === 'MUTATION' && !['PROJECT_CREATED', 'PROJECT_UPDATED', 'PROJECT_DELETED', 'TEAM_MODIFIED', 'SERVICE_MODIFIED', 'SETTINGS_UPDATED', 'FILE_UPLOADED'].includes(log.eventType)) return false;
      if (filterType === 'INQUIRIES' && !['INQUIRY_RECEIVED', 'INQUIRY_DELETED', 'VERIFICATION_ATTEMPT'].includes(log.eventType)) return false;

      // Status filter
      if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesActor = log.actor?.toLowerCase().includes(query);
        const matchesIp = log.ip?.toLowerCase().includes(query);
        const matchesType = log.eventType?.toLowerCase().includes(query);
        const matchesDetails = JSON.stringify(log.details || {}).toLowerCase().includes(query);
        return matchesActor || matchesIp || matchesType || matchesDetails;
      }

      return true;
    });
  }, [auditLogs, filterType, statusFilter, searchQuery]);

  const getEventBadge = (eventType, status) => {
    if (status === 'BLOCKED' || status === 'FAILURE') {
      return {
        bg: 'bg-red/10 border-red/30 text-red',
        icon: ShieldAlert
      };
    }
    if (eventType?.startsWith('AUTH_')) {
      return {
        bg: 'bg-cyan/10 border-cyan/30 text-cyan',
        icon: Lock
      };
    }
    if (['RATE_LIMIT_HIT', 'CSRF_VIOLATION', 'SSRF_ATTEMPT_BLOCKED'].includes(eventType)) {
      return {
        bg: 'bg-amber/10 border-amber/30 text-amber',
        icon: AlertTriangle
      };
    }
    if (['PROJECT_CREATED', 'PROJECT_UPDATED', 'TEAM_MODIFIED', 'SETTINGS_UPDATED', 'FILE_UPLOADED'].includes(eventType)) {
      return {
        bg: 'bg-purple/10 border-purple/30 text-purple',
        icon: Server
      };
    }
    return {
      bg: 'bg-green/10 border-green/30 text-green',
      icon: CheckCircle2
    };
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-text">Security & Audit Center</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan/15 text-cyan border border-cyan/30">
              Live Monitor
            </span>
          </div>
          <p className="text-xs font-mono text-muted mt-1">
            Real-time immutable audit trail for logins, rate limits, access control, and system operations
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface2 border border-border text-xs font-mono text-cyan hover:border-cyan disabled:opacity-50 transition-all active:scale-95"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span>refresh_logs()</span>
        </button>
      </div>

      {/* System Health Status Card */}
      {healthData && (
        <div className="p-5 rounded-2xl border border-border/80 bg-surface/90 backdrop-blur-md shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green/10 border border-green/30 flex items-center justify-center text-green shrink-0">
              <Activity size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-muted">Backend Service</div>
              <div className="text-sm font-bold text-text capitalize">{healthData.status || 'Healthy'}</div>
            </div>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l border-border/60 sm:pl-4">
            <div className="text-[11px] font-mono text-muted">API Service</div>
            <div className="text-xs font-mono text-cyan font-semibold truncate">{healthData.service || 'Syntax Studio API'}</div>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l border-border/60 sm:pl-4">
            <div className="text-[11px] font-mono text-muted">Version</div>
            <div className="text-xs font-mono text-amber font-semibold">v{healthData.version || '1.0.0'}</div>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l border-border/60 sm:pl-4">
            <div className="text-[11px] font-mono text-muted">Server Time</div>
            <div className="text-[11px] font-mono text-text truncate">
              {healthData.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'Online'}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl border border-border/80 bg-surface/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by IP, actor, event type, or details..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface2 border border-border text-xs text-text placeholder-muted focus:outline-none focus:border-cyan"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          {['ALL', 'AUTH', 'SECURITY', 'MUTATION', 'INQUIRIES'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1.5 rounded-lg border transition-all ${
                filterType === t
                  ? 'bg-amber text-ink font-semibold border-amber'
                  : 'bg-surface2 text-muted border-border hover:text-text'
              }`}
            >
              {t}
            </button>
          ))}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-surface2 border border-border text-xs font-mono text-text focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success Only</option>
            <option value="BLOCKED">Blocked Only</option>
            <option value="FAILURE">Failures Only</option>
          </select>
        </div>
      </div>

      {/* Logs Table / Stream */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-16 border border-border/70 rounded-2xl bg-surface/50 font-mono text-xs text-muted">
          <Terminal size={32} className="mx-auto text-muted mb-2 opacity-60" />
          <p>No audit log events match the current filter criteria.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-surface/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-surface2/80 text-muted uppercase tracking-wider text-[10px] border-b border-border/80">
                <tr>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredLogs.map((log) => {
                  const badge = getEventBadge(log.eventType, log.status);
                  const Icon = badge.icon;
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className={`hover:bg-surface2/40 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-surface2/60' : ''
                        }`}
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      >
                        <td className="py-3 px-4 font-semibold text-text">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] ${badge.bg}`}>
                            <Icon size={12} />
                            <span>{log.eventType}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              log.status === 'BLOCKED' || log.status === 'FAILURE'
                                ? 'bg-red/15 text-red border border-red/30'
                                : 'bg-green/15 text-green border border-green/30'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted truncate max-w-[150px]">
                          {log.actor || 'anonymous'}
                        </td>
                        <td className="py-3 px-4 text-cyan truncate max-w-[120px]">
                          {log.ip || '::1'}
                        </td>
                        <td className="py-3 px-4 text-muted whitespace-nowrap">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedLogId(isExpanded ? null : log.id);
                            }}
                            className="p-1 rounded text-muted hover:text-text"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Details Row */}
                      {isExpanded && (
                        <tr className="bg-ink/80 border-b border-border">
                          <td colSpan={6} className="p-4">
                            <div className="space-y-2 text-[11px]">
                              <div className="text-muted">
                                <span className="text-cyan font-semibold">User Agent:</span> {log.userAgent || 'Unknown'}
                              </div>
                              <div className="text-muted">
                                <span className="text-amber font-semibold">Log ID:</span> {log.id}
                              </div>
                              {log.details && (
                                <div className="mt-2">
                                  <span className="text-green font-semibold">Metadata:</span>
                                  <pre className="mt-1 p-3 rounded-lg bg-surface2/90 border border-border text-text overflow-x-auto">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
