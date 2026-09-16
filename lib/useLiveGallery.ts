'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchLivePhotos, type DrivePhoto } from './galleryFeed';
import {
  GALLERY_REFRESH_MS,
  GALLERY_VISIBILITY_REFRESH_MS,
} from './weddingConfig';

export function useLiveGallery(limit: number) {
  const [photos, setPhotos] = useState<DrivePhoto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const lastUpdatedRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (inFlight.current) return false;
    inFlight.current = true;
    const result = await fetchLivePhotos(undefined, limit);
    inFlight.current = false;
    if (!mounted.current) return false;
    if (result.ok) {
      setPhotos(result.photos);
      setError(null);
      setLastUpdated(result.fetchedAt);
      lastUpdatedRef.current = result.fetchedAt;
      return true;
    }
    setError(result.error);
    return false;
  }, [limit]);

  useEffect(() => {
    mounted.current = true;
    const initialLoad = window.setTimeout(refresh, 0);
    const interval = window.setInterval(refresh, GALLERY_REFRESH_MS);
    const handleVisibility = () => {
      const lastSuccess = lastUpdatedRef.current;
      if (document.visibilityState === 'visible' &&
          (!lastSuccess || Date.now() - lastSuccess >= GALLERY_VISIBILITY_REFRESH_MS)) {
        refresh();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      mounted.current = false;
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh]);

  return {
    photos,
    error,
    lastUpdated,
    refresh,
    isLoading: photos === null && error === null,
  };
}
