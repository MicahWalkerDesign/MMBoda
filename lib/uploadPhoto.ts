'use client';

// Parallel photo upload helper with real progress tracking.
//
// Uses XMLHttpRequest instead of fetch so we get `upload.onprogress`
// events (fetch doesn't expose request-body progress). We don't need to
// read the response — Apps Script's response is opaque to us anyway —
// so we treat `xhr.onload` as success regardless of status.
//
// Apps Script `/exec` accepts `Content-Type: text/plain;charset=utf-8`
// without a CORS preflight (it's a CORS-safelisted content type), so the
// XHR is sent directly and follows the 302 redirect to googleusercontent.

export interface UploadItem {
  base64: string;     // data: URL with mime prefix
  filename: string;
  filetype: string;
  bytes: number;      // approx body size (used for the progress bar)
}

export interface UploadProgress {
  /** 0 → 1 across all files in the batch */
  fraction: number;
  loaded: number;
  total: number;
  completedFiles: number;
  totalFiles: number;
  /** index of currently-processing file (or first in the queue) */
  currentIndex: number;
}

export interface UploadOptions {
  concurrency?: number;
  onProgress?: (p: UploadProgress) => void;
  signal?: AbortSignal;
}

function uploadOne(
  url: string,
  body: string,
  onBytes: (loaded: number) => void,
  signal?: AbortSignal
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    // Safelisted content type → no CORS preflight.
    xhr.setRequestHeader('Content-Type', 'text/plain;charset=utf-8');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onBytes(e.loaded);
    };
    xhr.upload.onload = () => onBytes(body.length);
    xhr.onload = () => resolve();
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.onabort = () => reject(new Error('Aborted'));
    xhr.ontimeout = () => reject(new Error('Timed out'));
    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        reject(new Error('Aborted'));
        return;
      }
      signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }
    xhr.send(body);
  });
}

/**
 * Upload photos to the Apps Script endpoint with bounded concurrency.
 * Returns the count of successful uploads.
 */
export async function uploadPhotos(
  url: string,
  items: UploadItem[],
  options: UploadOptions = {}
): Promise<{ successCount: number; failedCount: number }> {
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 3, items.length || 1));
  const totalBytes = items.reduce((s, i) => s + i.bytes, 0) || 1;
  const totalFiles = items.length;
  const loadedPerFile = new Array(items.length).fill(0);
  let completedFiles = 0;
  let queueIdx = 0;
  let successCount = 0;
  let failedCount = 0;

  const emit = (currentIndex: number) => {
    const loaded = loadedPerFile.reduce((s, n) => s + n, 0);
    options.onProgress?.({
      fraction: Math.min(1, loaded / totalBytes),
      loaded,
      total: totalBytes,
      completedFiles,
      totalFiles,
      currentIndex,
    });
  };

  const worker = async () => {
    while (true) {
      const idx = queueIdx < items.length ? queueIdx++ : -1;
      if (idx < 0) return;
      const item = items[idx];
      const body = JSON.stringify({
        file: item.base64,
        filename: item.filename,
        filetype: item.filetype,
      });
      emit(idx);
      try {
        await uploadOne(
          url,
          body,
          (n) => {
            loadedPerFile[idx] = Math.min(n, item.bytes);
            emit(idx);
          },
          options.signal
        );
        loadedPerFile[idx] = item.bytes;
        successCount++;
      } catch (err) {
        loadedPerFile[idx] = item.bytes; // Still count toward progress so the bar finishes.
        failedCount++;
        console.error('upload failed', item.filename, err);
      }
      completedFiles++;
      emit(idx);
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));
  return { successCount, failedCount };
}
