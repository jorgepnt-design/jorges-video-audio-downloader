import { randomUUID } from "node:crypto";
import type { GalleryItem, MediaType } from "./types";

export type JobStatus = "running" | "done" | "error";

export type DownloadJob = {
  id: string;
  type: MediaType;
  status: JobStatus;
  progress: number; // 0-100
  stage: string;
  item?: GalleryItem;
  error?: string;
  createdAt: number;
};

type Listener = (job: DownloadJob) => void;

const jobs = new Map<string, DownloadJob>();
const listeners = new Map<string, Set<Listener>>();

// Abgeschlossene Jobs nach einer Weile aufräumen, damit der Speicher nicht
// unbegrenzt wächst.
const JOB_TTL_MS = 10 * 60 * 1000;

export function createJob(type: MediaType): DownloadJob {
  const job: DownloadJob = {
    id: randomUUID(),
    type,
    status: "running",
    progress: 0,
    stage: "Wird vorbereitet",
    createdAt: Date.now(),
  };
  jobs.set(job.id, job);
  return job;
}

export function getJob(id: string): DownloadJob | undefined {
  return jobs.get(id);
}

export function updateJob(id: string, patch: Partial<DownloadJob>) {
  const job = jobs.get(id);
  if (!job) return;
  Object.assign(job, patch);
  emit(job);

  if (job.status === "done" || job.status === "error") {
    setTimeout(() => {
      jobs.delete(id);
      listeners.delete(id);
    }, JOB_TTL_MS).unref?.();
  }
}

export function subscribe(id: string, listener: Listener): () => void {
  let set = listeners.get(id);
  if (!set) {
    set = new Set();
    listeners.set(id, set);
  }
  set.add(listener);
  return () => {
    set?.delete(listener);
  };
}

function emit(job: DownloadJob) {
  const set = listeners.get(job.id);
  if (!set) return;
  for (const listener of set) {
    try {
      listener(job);
    } catch {
      // Einen kaputten Listener nicht den Rest blockieren lassen.
    }
  }
}
