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

/**
 * Maximum number of photos shown in the on-site gallery views (homepage
 * carousel + /gallery page). The rest are accessible via the
 * "View All Photos on Google Drive" link. Keep small so the page
 * stays fast and visually focused on the latest uploads.
 */
export const GALLERY_MAX_PHOTOS = 10;

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

/**
 * Fetch the live photo list. Returns [] on any error or empty folder.
 *
 * Uses a query-string cache buster (`?t=…`) instead of `cache: 'no-store'`
 * because the latter would add a `Cache-Control: no-cache` request header,
 * which is not a CORS-safelisted header — it would force the browser to send
 * an OPTIONS preflight, and Apps Script `/exec` returns 405 for OPTIONS,
 * blocking the request entirely.
 */
export async function fetchLivePhotos(signal?: AbortSignal): Promise<DrivePhoto[]> {
  try {
    const url = `${GALLERY_FEED_URL}?t=${Date.now()}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const data = (await res.json()) as FeedResponse;
    if (!Array.isArray(data.photos)) return [];
    // Newest uploads first, then keep only the most recent N. The full
    // album is always available via the Drive folder link.
    return [...data.photos]
      .sort((a, b) => (b.modified ?? 0) - (a.modified ?? 0))
      .slice(0, GALLERY_MAX_PHOTOS);
  } catch {
    return [];
  }
}
