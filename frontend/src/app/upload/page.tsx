'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { documentsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatFileSize } from '@/lib/utils';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Plus, CloudUpload } from 'lucide-react';

interface FileItem {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  jobId?: number;
  error?: string;
}

export default function UploadPage() {
  const router   = useRouter();
  const [files, setFiles]       = useState<FileItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const addFiles = (newFiles: FileList | File[]) => {
    const items: FileItem[] = Array.from(newFiles).map(file => ({
      file, id: crypto.randomUUID(), status: 'pending',
    }));
    setFiles(prev => [...prev, ...items]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const upload = async () => {
    const pending = files.filter(f => f.status === 'pending');
    if (!pending.length) return;
    setUploading(true);
    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' } : f));
    try {
      const { data } = await documentsApi.upload(pending.map(f => f.file));
      setFiles(prev => prev.map(f => {
        const job = data.jobs.find((j: any) => j.filename === f.file.name);
        return f.status === 'uploading' ? { ...f, status: 'done', jobId: job?.job_id } : f;
      }));
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setFiles(prev => prev.map(f =>
        f.status === 'uploading' ? { ...f, status: 'error', error: 'Upload failed' } : f
      ));
    } finally { setUploading(false); }
  };

  const pendingCount = files.filter(f => f.status === 'pending').length;
  const doneCount    = files.filter(f => f.status === 'done').length;

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-xl font-bold text-ink">Upload Documents</h1>
        <p className="text-sm text-ink-muted mt-0.5">Files are processed asynchronously with live progress tracking</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-200 overflow-hidden group ${
          dragging
            ? 'drag-active'
            : 'border-surface-border hover:border-[rgba(255,255,255,0.15)] hover:bg-surface-hover/40'
        }`}
      >
        {/* Subtle gradient when dragging */}
        {dragging && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-brand-dim/5 pointer-events-none" />
        )}

        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 ${
            dragging
              ? 'bg-brand/15 border-brand/40 shadow-glow-sm'
              : 'bg-surface-overlay border-surface-border group-hover:border-[rgba(255,255,255,0.12)]'
          }`}>
            <CloudUpload className={`w-7 h-7 transition-colors duration-200 ${dragging ? 'text-brand-light' : 'text-ink-faint group-hover:text-ink-muted'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">
              {dragging ? 'Release to upload' : 'Drop files here or click to browse'}
            </p>
            <p className="text-xs text-ink-faint mt-1.5">TXT, PDF, DOCX, CSV, JSON — up to 50 MB per file</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => { e.stopPropagation(); document.getElementById('file-input')?.click(); }}
          >
            <Plus className="w-3.5 h-3.5" />
            Choose files
          </Button>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-surface-raised border border-surface-border rounded-xl px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                item.status === 'done'
                  ? 'bg-emerald-400/10 border-emerald-400/25'
                  : item.status === 'error'
                  ? 'bg-red-400/10 border-red-400/25'
                  : 'bg-surface-overlay border-surface-border'
              }`}>
                {item.status === 'done'
                  ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  : item.status === 'error'
                  ? <AlertCircle className="w-4 h-4 text-red-400" />
                  : <FileText className="w-4 h-4 text-ink-faint" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink truncate">{item.file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-ink-faint font-mono">{formatFileSize(item.file.size)}</span>
                  {item.status === 'uploading' && (
                    <ProgressBar value={50} animated className="flex-1 max-w-[100px]" />
                  )}
                  {item.status === 'done' && (
                    <span className="text-xs text-emerald-400 font-medium">Queued for processing</span>
                  )}
                  {item.status === 'error' && (
                    <span className="text-xs text-red-400">{item.error}</span>
                  )}
                </div>
              </div>
              {item.status === 'pending' && (
                <button
                  onClick={() => removeFile(item.id)}
                  className="text-ink-faint hover:text-ink-muted hover:bg-surface-hover rounded-lg p-1 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {files.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-ink-muted">
            {pendingCount > 0
              ? `${pendingCount} file${pendingCount > 1 ? 's' : ''} ready to upload`
              : doneCount > 0
              ? `${doneCount} file${doneCount > 1 ? 's' : ''} uploaded — redirecting…`
              : ''}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setFiles([])}>
              Clear all
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={uploading}
              disabled={pendingCount === 0}
              onClick={upload}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload {pendingCount > 0 ? `${pendingCount} file${pendingCount > 1 ? 's' : ''}` : ''}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
