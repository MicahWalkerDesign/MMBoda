'use client';

import { UPLOAD_TIMEOUT_MS } from './weddingConfig';

export interface UploadItem {
  base64: string;
  filename: string;
  filetype: string;
  bytes: number;
}

export interface UploadProgress {
  fraction: number;
  loaded: number;
  total: number;
  completedFiles: number;
  totalFiles: number;
  currentIndex: number;
}

export interface UploadFileResult {
  index: number;
  filename: string;
  success: boolean;
  id?: string;
  error?: string;
}

export interface UploadBatchResult {
  successCount: number;
  failedCount: number;
  results: UploadFileResult[];
}

export interface UploadOptions {
  concurrency?: number;
  timeoutMs?: number;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
}

interface UploadResponse {
  ok?: boolean;
  id?: string;
  error?: string;
  reason?: string;
}

function uploadOne(
  url: string,
  body: string,
  onBytes: (loaded: number) => void,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<UploadResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });

  return fetch(url, {
    method: 'POST',
    // Apps Script redirects POST responses to a different Google origin. An
    // opaque simple request lets the upload complete without a CORS readback.
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
    signal: controller.signal,
  }).then(() => {
    onBytes(new Blob([body]).size);
    return { ok: true };
  }).catch((error) => {
    if (controller.signal.aborted) {
      throw new Error(signal?.aborted ? 'Upload cancelled.' : 'Upload timed out.');
    }
    throw error instanceof Error ? error : new Error('Network error.');
  }).finally(() => {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  });
}

export async function uploadPhotos(
  url: string,
  items: UploadItem[],
  options: UploadOptions = {}
): Promise<UploadBatchResult> {
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 2, items.length || 1));
  const payloads = items.map((item) => JSON.stringify({
    file: item.base64,
    filename: item.filename,
    filetype: item.filetype,
  }));
  const payloadSizes = payloads.map((body) => new Blob([body]).size);
  const totalBytes = payloadSizes.reduce((sum, size) => sum + size, 0) || 1;
  const loadedPerFile = new Array(items.length).fill(0);
  const results: UploadFileResult[] = new Array(items.length);
  let completedFiles = 0;
  let queueIndex = 0;

  const emit = (currentIndex: number) => {
    const loaded = loadedPerFile.reduce((sum, value) => sum + value, 0);
    options.onProgress?.({
      fraction: Math.min(1, loaded / totalBytes),
      loaded,
      total: totalBytes,
      completedFiles,
      totalFiles: items.length,
      currentIndex,
    });
  };

  const worker = async () => {
    while (true) {
      const index = queueIndex < items.length ? queueIndex++ : -1;
      if (index < 0) return;
      const item = items[index];
      emit(index);
      try {
        const response = await uploadOne(
          url,
          payloads[index],
          (loaded) => {
            loadedPerFile[index] = Math.min(loaded, payloadSizes[index]);
            emit(index);
          },
          options.timeoutMs ?? UPLOAD_TIMEOUT_MS,
          options.signal
        );
        results[index] = {
          index,
          filename: item.filename,
          success: true,
          id: response.id,
        };
      } catch (error) {
        results[index] = {
          index,
          filename: item.filename,
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed.',
        };
      }
      loadedPerFile[index] = payloadSizes[index];
      completedFiles++;
      emit(index);
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));
  const successCount = results.filter((result) => result.success).length;
  return {
    successCount,
    failedCount: items.length - successCount,
    results,
  };
}
