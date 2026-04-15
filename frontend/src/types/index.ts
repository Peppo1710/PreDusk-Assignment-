export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface JobListItem {
  id: number;
  document_id: number;
  status: JobStatus;
  progress: number;
  current_step: string | null;
  is_finalized: boolean;
  retry_count: number;
  queued_at: string;
  completed_at: string | null;
  original_filename: string;
  file_size: number;
  file_type: string;
}

export interface JobResult {
  title: string;
  category: string;
  summary: string;
  keywords: string[];
  metadata: Record<string, unknown>;
  confidence_score: number;
}

export interface Job {
  id: number;
  status: JobStatus;
  progress: number;
  current_step: string | null;
  error_message: string | null;
  retry_count: number;
  result: JobResult | null;
  reviewed_result: JobResult | null;
  is_reviewed: boolean;
  is_finalized: boolean;
  queued_at: string;
  started_at: string | null;
  completed_at: string | null;
  celery_task_id: string | null;
}

export interface DocumentDetail {
  id: number;
  original_filename: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  created_at: string;
}

export interface JobDetailResponse {
  document: DocumentDetail;
  job: Job;
}

export interface ProgressEvent {
  event: string;
  progress: number;
  message: string;
  timestamp: string;
  job_id?: number;
  data?: Record<string, unknown>;
}
