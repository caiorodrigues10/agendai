import { useCallback, useEffect, useState } from 'react';
import { socialApi } from '../../infra/socialApi';
import type { GalleryPhoto } from '../../infra/socialApi';
import type { FeedPost } from '../../types';

export interface SocialResource<T> {
  data: T;
  loading: boolean;
  error: boolean;
}

interface LoadResult<T> {
  load: () => Promise<T>;
  version: number;
  data: T;
  error: boolean;
}

/**
 * Loads `load()` when enabled. State is derived during render: a result only
 * counts once it matches the current request (load identity + reload version),
 * so no setState is needed to reset stale/loading state inside the effect.
 */
function useResource<T>(load: () => Promise<T>, initial: T, enabled = true) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<LoadResult<T> | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void load()
      .then(data => {
        if (active) setResult({ load, version, data, error: false });
      })
      .catch(() => {
        if (active) setResult({ load, version, data: initial, error: true });
      });
    return () => {
      active = false;
    };
    // Initial values are stable constants; changing a tenant always changes load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, load, version]);
  const current =
    enabled && result && result.load === load && result.version === version ? result : null;
  const resource: SocialResource<T> = current
    ? { data: current.data, loading: false, error: current.error }
    : { data: initial, loading: enabled, error: false };
  return { ...resource, reload: () => setVersion(v => v + 1) };
}

const EMPTY_POSTS: FeedPost[] = [];
const EMPTY_GALLERY: GalleryPhoto[] = [];
export function useSalonSocial(salonId: string | null | undefined) {
  const loadStories = useCallback(
    () => (salonId ? socialApi.stories(salonId) : Promise.resolve(EMPTY_POSTS)),
    [salonId]
  );
  const loadGallery = useCallback(
    () => (salonId ? socialApi.gallery(salonId) : Promise.resolve(EMPTY_GALLERY)),
    [salonId]
  );
  const enabled = Boolean(salonId);
  return {
    stories: useResource(loadStories, EMPTY_POSTS, enabled),
    gallery: useResource(loadGallery, EMPTY_GALLERY, enabled),
  };
}
