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
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let settled = false;
    const abort = () => xhr.abort();
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', abort);
      callback();
    };

    xhr.open('POST', url);
    xhr.timeout = timeoutMs;
    xhr.setRequestHeader('Content-Type', 'text/plain;charset=utf-8');
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onBytes(event.loaded);
    };
    xhr.upload.onload = () => onBytes(new Blob([body]).size);
    xhr.onload = () => finish(() => {
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(`Upload failed with HTTP ${xhr.status}.`));
        return;
      }
      try {
        const response = JSON.parse(xhr.responseText) as UploadResponse;
        if (response.ok !== true || !response.id) {
          reject(new Error(response.error || response.reason || 'The server did not confirm the upload.'));
          return;
        }
        resolve(response);
      } catch {
        reject(new Error('The server returned an invalid response.'));
      }
    });
    xhr.onerror = () => finish(() => reject(new Error('Network error.')));
    xhr.onabort = () => finish(() => reject(new Error('Upload cancelled.')));
    xhr.ontimeout = () => finish(() => reject(new Error('Upload timed out.')));

    if (signal) {
      if (signal.aborted) {
        reject(new Error('Upload cancelled.'));
        return;
      }
      signal.addEventListener('abort', abort, { once: true });
    }
    xhr.send(body);
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
