'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api';
import { useJobProgress } from '@/hooks/useJobProgress';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { formatFileSize, formatDate, formatDuration, getStepLabel, downloadJSON, downloadCSV } from '@/lib/utils';
import { JobResult } from '@/types';
import {
  ArrowLeft, RefreshCw, Download, CheckCheck, RotateCcw,
  FileText, Cpu, Clock, BarChart3, Tag, AlignLeft, Edit3,
  Save, X, Wifi, WifiOff, ChevronRight,
} from 'lucide-react';

const PROGRESS_STEPS = [
  { key: 'job_queued',                  label: 'Queued',     pct: 0   },
  { key: 'document_received',           label: 'Received',   pct: 2   },
  { key: 'job_started',                 label: 'Started',    pct: 5   },
  { key: 'document_parsing_started',    label: 'Parsing',    pct: 15  },
  { key: 'document_parsing_completed',  label: 'Parsed',     pct: 40  },
  { key: 'field_extraction_started',    label: 'Extracting', pct: 55  },
  { key: 'field_extraction_completed',  label: 'Extracted',  pct: 80  },
  { key: 'final_result_stored',         label: 'Stored',     pct: 92  },
  { key: 'job_completed',               label: 'Done',       pct: 100 },
];

export default function JobDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const qc        = useQueryClient();
  const jobId     = parseInt(id);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => documentsApi.detail(jobId).then(r => r.data),
    refetchInterval: (query) => {
      const s = (query.state.data as any)?.status;
      return s === 'processing' || s === 'queued' ? 2000 : false;
    },
  });

  const job      = data?.job;
  const doc      = data?.document;
  const isActive = job?.status === 'processing' || job?.status === 'queued';

  const { events, latestEvent, isConnected } = useJobProgress(isActive ? jobId : null, isActive);

  const [editing, setEditing]       = useState(false);
  const [editResult, setEditResult] = useState<Partial<JobResult>>({});

  useEffect(() => {
    if (job?.result && !editing) setEditResult(job.reviewed_result || job.result);
  }, [job?.result]);

  useEffect(() => {
    if (latestEvent) refetch();
  }, [latestEvent?.event]);

  const retryMutation = useMutation({
    mutationFn: () => documentsApi.retry(jobId),
    onSuccess: () => refetch(),
  });

  const saveMutation = useMutation({
    mutationFn: () => documentsApi.updateResult(jobId, editResult as Record<string, unknown>),
    onSuccess: () => { setEditing(false); refetch(); },
  });

  const finalizeMutation = useMutation({
    mutationFn: () => documentsApi.finalize(jobId),
    onSuccess: () => refetch(),
  });

  const handleExport = async (format: 'json' | 'csv') => {
    const { data: exp } = await documentsApi.exportDoc(jobId, format);
    if (format === 'json') downloadJSON(exp, `docflow-job-${jobId}.json`);
    else {
      const result = exp.result || {};
      const csv = Object.entries(result).map(([k, v]) =>
        `${k},"${String(v).replace(/"/g, '""')}"`
      ).join('\n');
      downloadCSV(`key,value\n${csv}`, `docflow-job-${jobId}.csv`);
    }
  };

  const currentStepIdx = PROGRESS_STEPS.findIndex(s => s.key === job?.current_step);

  if (isLoading) return (
    <div className="p-6 space-y-4 animate-fade-in">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton rounded-2xl" style={{ height: `${96 + i * 12}px` }} />
      ))}
    </div>
  );

  if (!job || !doc) return (
    <div className="p-6 text-center py-24 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-surface-overlay border border-surface-border flex items-center justify-center mx-auto mb-4">
        <FileText className="w-6 h-6 text-ink-faint" />
      </div>
      <p className="text-sm font-medium text-ink-muted">Job not found</p>
      <Button variant="secondary" size="sm" className="mt-4" onClick={() => router.push('/dashboard')}>
        Back to dashboard
      </Button>
    </div>
  );

  const displayResult = job.reviewed_result || job.result;

  return (
    <div className="p-6 space-y-5 max-w-4xl animate-fade-in">

      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-0.5 text-ink-faint hover:text-ink-muted transition-colors p-1.5 rounded-xl hover:bg-surface-hover"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-ink">{doc.original_filename}</h1>
              <StatusBadge status={job.status} />
              {job.is_finalized && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                  <CheckCheck className="w-3 h-3" /> Finalized
                </span>
              )}
            </div>
            <p className="text-xs text-ink-faint mt-0.5 font-mono">
              Job #{job.id} &middot; {formatFileSize(doc.file_size)} &middot; {doc.file_type.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center flex-wrap justify-end">
          {isActive && (
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
              isConnected
                ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                : 'text-ink-faint border-surface-border'
            }`}>
              {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isConnected ? 'Live' : 'Polling'}
            </div>
          )}
          {job.status === 'failed' && (
            <Button variant="secondary" size="sm" loading={retryMutation.isPending} onClick={() => retryMutation.mutate()}>
              <RotateCcw className="w-3.5 h-3.5" /> Retry
            </Button>
          )}
          {job.status === 'completed' && !job.is_finalized && (
            <>
              {!editing ? (
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                  <Button variant="secondary" size="sm" loading={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                    <Save className="w-3.5 h-3.5" /> Save
                  </Button>
                </>
              )}
              <Button variant="primary" size="sm" loading={finalizeMutation.isPending} onClick={() => finalizeMutation.mutate()}>
                <CheckCheck className="w-3.5 h-3.5" /> Finalize
              </Button>
            </>
          )}
          {job.status === 'completed' && (
            <div className="flex gap-1.5">
              <Button variant="secondary" size="sm" onClick={() => handleExport('json')}>
                <Download className="w-3.5 h-3.5" /> JSON
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleExport('csv')}>
                <Download className="w-3.5 h-3.5" /> CSV
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Progress pipeline ───────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand/15 border border-brand/25 flex items-center justify-center">
                <Cpu className="w-3.5 h-3.5 text-brand-light" />
              </div>
              <span className="text-sm font-semibold text-ink">Processing Pipeline</span>
            </div>
            <span className="text-xs font-mono text-ink-muted tabular-nums">
              {job.progress.toFixed(0)}%
            </span>
          </div>
          <ProgressBar value={job.progress} animated={isActive} className="mt-3 h-2" />
        </CardHeader>
        <CardBody>
          <div className="flex items-start gap-0 overflow-x-auto pb-2">
            {PROGRESS_STEPS.map((step, i) => {
              const done   = currentStepIdx >= i;
              const active = currentStepIdx === i && isActive;
              return (
                <div key={step.key} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                      active ? 'bg-brand border-brand-light shadow-glow-sm animate-pulse' :
                      done   ? 'bg-brand border-brand' :
                               'bg-transparent border-surface-border'
                    }`} />
                    <span className={`text-[10px] whitespace-nowrap font-medium ${
                      active ? 'text-brand-light' :
                      done   ? 'text-ink-muted' :
                               'text-ink-faint'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < PROGRESS_STEPS.length - 1 && (
                    <div className={`flex-1 h-px mb-5 mx-0.5 transition-all duration-500 ${
                      done && currentStepIdx > i
                        ? 'bg-gradient-to-r from-brand to-brand-light'
                        : 'bg-surface-border'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Live events */}
          {events.length > 0 && (
            <div className="mt-4 pt-4 border-t border-surface-border space-y-1.5 max-h-32 overflow-y-auto">
              {[...events].reverse().map((evt, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-ink-faint font-mono w-20 flex-shrink-0 tabular-nums">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                  <ChevronRight className="w-3 h-3 text-ink-faint flex-shrink-0" />
                  <span className="text-ink-muted">{evt.message || getStepLabel(evt.event)}</span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Timestamps ──────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Queued',   value: formatDate(job.queued_at),                              icon: Clock },
          { label: 'Started',  value: job.started_at ? formatDate(job.started_at) : '—',      icon: Cpu },
          { label: 'Duration', value: formatDuration(job.queued_at, job.completed_at),         icon: BarChart3 },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-surface-raised border border-surface-border rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <div className="flex items-center gap-2 mb-2.5">
              <Icon className="w-3.5 h-3.5 text-ink-faint" />
              <span className="text-xs text-ink-faint">{label}</span>
            </div>
            <p className="text-sm font-mono font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Extracted result ────────────────────────── */}
      {displayResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-surface-overlay border border-surface-border flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-ink-faint" />
              </div>
              <span className="text-sm font-semibold text-ink">Extracted Data</span>
              {job.is_reviewed && !job.is_finalized && (
                <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full font-medium">
                  Edited
                </span>
              )}
            </div>
          </CardHeader>
          <CardBody className="space-y-5">
            {/* Title & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-ink-faint flex items-center gap-1.5 mb-2 font-medium">
                  <Tag className="w-3 h-3" /> Title
                </label>
                {editing ? (
                  <input
                    value={editResult.title || ''}
                    onChange={e => setEditResult({ ...editResult, title: e.target.value })}
                    className="w-full bg-surface-overlay border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]"
                  />
                ) : (
                  <p className="text-sm font-medium text-ink">{displayResult.title}</p>
                )}
              </div>
              <div>
                <label className="text-xs text-ink-faint flex items-center gap-1.5 mb-2 font-medium">
                  <BarChart3 className="w-3 h-3" /> Category
                </label>
                {editing ? (
                  <input
                    value={editResult.category || ''}
                    onChange={e => setEditResult({ ...editResult, category: e.target.value })}
                    className="w-full bg-surface-overlay border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]"
                  />
                ) : (
                  <p className="text-sm font-medium text-ink">{displayResult.category}</p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="text-xs text-ink-faint flex items-center gap-1.5 mb-2 font-medium">
                <AlignLeft className="w-3 h-3" /> Summary
              </label>
              {editing ? (
                <textarea
                  value={editResult.summary || ''}
                  rows={4}
                  onChange={e => setEditResult({ ...editResult, summary: e.target.value })}
                  className="w-full bg-surface-overlay border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 resize-none transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]"
                />
              ) : (
                <p className="text-sm text-ink-muted leading-relaxed">{displayResult.summary}</p>
              )}
            </div>

            {/* Keywords */}
            <div>
              <label className="text-xs text-ink-faint flex items-center gap-1.5 mb-2.5 font-medium">
                <Tag className="w-3 h-3" /> Keywords
              </label>
              <div className="flex flex-wrap gap-1.5">
                {displayResult.keywords?.map((kw) => (
                  <span
                    key={kw}
                    className="px-2.5 py-0.5 bg-brand/10 border border-brand/20 rounded-full text-xs text-brand-light font-mono"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="pt-4 border-t border-surface-border">
              <p className="text-xs font-semibold text-ink-faint mb-3 uppercase tracking-wide">Metadata</p>
              <div className="grid grid-cols-3 gap-2.5">
                {Object.entries(displayResult.metadata || {}).map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-surface-overlay border border-surface-border rounded-xl px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                  >
                    <p className="text-[10px] text-ink-faint capitalize font-medium">{k.replace(/_/g, ' ')}</p>
                    <p className="text-xs font-mono text-ink-muted mt-0.5 truncate">{String(v)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence score */}
            <div className="flex items-center justify-between pt-3 border-t border-surface-border">
              <span className="text-xs text-ink-faint font-medium">Confidence Score</span>
              <div className="flex items-center gap-3">
                <ProgressBar value={(displayResult.confidence_score || 0) * 100} className="w-28" />
                <span className="text-xs font-mono font-semibold text-ink-muted tabular-nums">
                  {((displayResult.confidence_score || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* ── Error state ─────────────────────────────── */}
      {job.status === 'failed' && job.error_message && (
        <Card>
          <CardBody>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center flex-shrink-0">
                <X className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-400">Processing Failed</p>
                <p className="text-xs text-ink-muted mt-1.5 font-mono leading-relaxed">{job.error_message}</p>
                <p className="text-xs text-ink-faint mt-2">Retry count: <span className="text-ink-muted font-mono">{job.retry_count}</span></p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
