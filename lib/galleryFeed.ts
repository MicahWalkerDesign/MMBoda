// Live gallery feed helpers.
//
// The Apps Script `doGet` returns:
//   { photos: [{ id, name, mime, modified }] }
// This module wraps the fetch + builds public Drive thumbnail URLs that
// can be rendered without auth as long as the folder is shared
// "Anyone with the link → Viewer".

export const GALLERY_FEED_URL =
  'https://script.google.com/macros/s/AKfycbytpRJvfdeZHWyE9M7ijlMnhFc-ljWb_NsDkN4xzhr93wnn3yv-YJMkcyMhbOit-JCn/exec';

/** How often the live gallery refreshes itself, in milliseconds. */
export const GALLERY_REFRESH_MS = 15 * 60 * 1000;

export interface DrivePhoto {
  id: string;
  name: string;
  mime: string;
  modified: number;
}

interface FeedResponse {
  photos?: DrivePhoto[];
}

/**
 * Public Drive image URL via the underlying googleusercontent CDN.
 * lh3.googleusercontent.com hotlinks more reliably than drive.google.com/thumbnail
 * (no redirect, no Drive UI session checks). Works for any file shared
 * "Anyone with the link → Viewer".
 */
export function driveThumb(id: string, width = 1200): string {
  return `https://lh3.googleusercontent.com/d/${id}=w${width}`;
}

/** Fetch the live photo list. Returns [] on any error or empty folder. */
export async function fetchLivePhotos(signal?: AbortSignal): Promise<DrivePhoto[]> {
  try {
    const res = await fetch(GALLERY_FEED_URL, { signal, cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as FeedResponse;
    return Array.isArray(data.photos) ? data.photos : [];
  } catch {
    return [];
  }
}
