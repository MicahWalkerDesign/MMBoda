import { APPS_SCRIPT_URL } from './weddingConfig';

export interface DrivePhoto {
  id: string;
  name: string;
  mime: string;
  modified: number;
}

export type GalleryFeedResult =
  | { ok: true; photos: DrivePhoto[]; fetchedAt: number }
  | { ok: false; photos: []; error: string; fetchedAt: number };

interface FeedResponse {
  ok?: boolean;
  photos?: unknown;
  error?: string;
}

const DRIVE_ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;

export function driveThumb(id: string, width = 1200): string {
  return `https://lh3.googleusercontent.com/d/${id}=w${width}`;
}

function isDrivePhoto(value: unknown): value is DrivePhoto {
  if (!value || typeof value !== 'object') return false;
  const photo = value as Partial<DrivePhoto>;
  return typeof photo.id === 'string'
    && DRIVE_ID_PATTERN.test(photo.id)
    && typeof photo.name === 'string'
    && typeof photo.mime === 'string'
    && photo.mime.startsWith('image/')
    && typeof photo.modified === 'number'
    && Number.isFinite(photo.modified);
}

export async function fetchLivePhotos(
  signal?: AbortSignal,
  limit?: number,
  timeoutMs = 30000
): Promise<GalleryFeedResult> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?t=${Date.now()}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Gallery request failed with HTTP ${response.status}.`);
    const data = (await response.json()) as FeedResponse;
    if (data.ok === false) throw new Error(data.error || 'Gallery service unavailable.');
    if (!Array.isArray(data.photos)) throw new Error('Gallery returned invalid data.');

    const photos = data.photos
      .filter(isDrivePhoto)
      .sort((a, b) => b.modified - a.modified);
    return {
      ok: true,
      photos: typeof limit === 'number' ? photos.slice(0, limit) : photos,
      fetchedAt: Date.now(),
    };
  } catch (error) {
    return {
      ok: false,
      photos: [],
      error: controller.signal.aborted && !signal?.aborted
        ? 'Gallery request timed out.'
        : error instanceof Error ? error.message : 'Gallery service unavailable.',
      fetchedAt: Date.now(),
    };
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
