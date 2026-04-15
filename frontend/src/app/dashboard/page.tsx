'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api';
import { JobListItem, JobStatus } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatFileSize, formatDate, formatDuration, getStepLabel } from '@/lib/utils';
import {
  Search, Upload, RefreshCw, FileText, CheckCircle2,
  Clock, AlertCircle, ChevronUp, ChevronDown, ExternalLink,
  Layers,
} from 'lucide-react';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All',        value: '' },
  { label: 'Queued',     value: 'queued' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed',  value: 'completed' },
  { label: 'Failed',     value: 'failed' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [page, setPage]         = useState(1);
  const [sortBy, setSortBy]     = useState('queued_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['jobs', page, status, search, sortBy, sortOrder],
    queryFn: () =>
      documentsApi
        .list({ page, page_size: 20, status: status || undefined, search: search || undefined, sort_by: sortBy, sort_order: sortOrder })
        .then(r => r.data),
    refetchInterval: 3000,
  });

  const jobs: JobListItem[] = data?.items || [];
  const total  = data?.total || 0;
  const pages  = data?.pages || 1;

  const stats = {
    total:      data?.total || 0,
    completed:  jobs.filter(j => j.status === 'completed').length,
    processing: jobs.filter(j => j.status === 'processing' || j.status === 'queued').length,
    failed:     jobs.filter(j => j.status === 'failed').length,
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  const SortIcon = ({ field }: { field: string }) =>
    sortBy === field
      ? (sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)
      : <ChevronDown className="w-3 h-3 opacity-25" />;

  return (
    <div className="p-6 space-y-6 animate-fade-in">

      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Jobs Dashboard</h1>
          <p className="text-sm text-ink-muted mt-0.5">Track your document processing pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => refetch()} className={isFetching ? 'opacity-50' : ''}>
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push('/upload')}>
            <Upload className="w-3.5 h-3.5" />
            Upload
          </Button>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Jobs',  value: total,            icon: Layers,       color: 'text-ink-muted',   bg: 'bg-surface-overlay', border: 'border-surface-border' },
          { label: 'Completed',   value: stats.completed,  icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10',  border: 'border-emerald-400/20' },
          { label: 'Processing',  value: stats.processing, icon: Clock,        color: 'text-brand-light', bg: 'bg-brand/10',        border: 'border-brand/20' },
          { label: 'Failed',      value: stats.failed,     icon: AlertCircle,  color: 'text-red-400',     bg: 'bg-red-400/10',      border: 'border-red-400/20' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className="bg-surface-raised border border-surface-border rounded-2xl p-4 shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-ink-faint">{label}</p>
              <div className={`w-7 h-7 rounded-lg ${bg} border ${border} flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${color === 'text-ink-muted' ? 'text-ink' : color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters bar ─────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faint pointer-events-none" />
          <input
            className="w-full bg-surface-raised border border-surface-border rounded-xl pl-9 pr-4 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 hover:border-[rgba(255,255,255,0.12)] transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.2)]"
            placeholder="Search files…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 p-1 bg-surface-raised border border-surface-border rounded-xl">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                status === f.value
                  ? 'bg-brand/15 text-brand-light border border-brand/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'text-ink-faint hover:text-ink-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────── */}
      <div className="bg-surface-raised border border-surface-border rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-border">
              {[
                { label: 'File',     field: 'filename' },
                { label: 'Status',   field: 'status' },
                { label: 'Progress', field: 'progress' },
                { label: 'Step',     field: null },
                { label: 'Size',     field: 'file_size' },
                { label: 'Queued',   field: 'queued_at' },
                { label: 'Duration', field: null },
                { label: '',         field: null },
              ].map(({ label, field }) => (
                <th
                  key={label}
                  onClick={() => field && toggleSort(field)}
                  className={`px-4 py-3 text-left text-[11px] font-semibold text-ink-faint uppercase tracking-wide ${
                    field ? 'cursor-pointer hover:text-ink-muted select-none' : ''
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    {field && <SortIcon field={field} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-surface-border/50">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="skeleton h-3.5 rounded-lg" style={{ width: `${40 + ((i * j * 17) % 60)}px` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-surface-overlay border border-surface-border flex items-center justify-center">
                      <FileText className="w-6 h-6 text-ink-faint" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-muted">No jobs found</p>
                      <p className="text-xs text-ink-faint mt-1">Upload a document to get started</p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => router.push('/upload')}>
                      <Upload className="w-3.5 h-3.5" /> Upload document
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-surface-border/40 hover:bg-surface-hover/60 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-surface-overlay border border-surface-border flex items-center justify-center flex-shrink-0">
                        <FileText className="w-3.5 h-3.5 text-ink-faint" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink truncate max-w-[140px]">{job.original_filename}</p>
                        <p className="text-[10px] text-ink-faint uppercase font-mono tracking-wide">{job.file_type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3.5 w-32">
                    <div className="space-y-1.5">
                      <ProgressBar value={job.progress} animated={job.status === 'processing'} />
                      <p className="text-[11px] text-ink-faint font-mono">{job.progress.toFixed(0)}%</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-ink-muted">{getStepLabel(job.current_step)}</td>
                  <td className="px-4 py-3.5 text-xs text-ink-muted font-mono">{formatFileSize(job.file_size)}</td>
                  <td className="px-4 py-3.5 text-xs text-ink-muted">{formatDate(job.queued_at)}</td>
                  <td className="px-4 py-3.5 text-xs text-ink-muted font-mono">{formatDuration(job.queued_at, job.completed_at)}</td>
                  <td className="px-4 py-3.5">
                    <ExternalLink className="w-3.5 h-3.5 text-brand-light opacity-0 group-hover:opacity-60 transition-opacity" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────────────── */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm pt-1">
          <p className="text-xs text-ink-faint">
            Page <span className="text-ink-muted font-medium">{page}</span> of {pages} &middot; {total} total
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
