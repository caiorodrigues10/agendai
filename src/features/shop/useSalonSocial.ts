import { useCallback, useEffect, useState } from 'react';
import { socialApi } from '../../infra/socialApi';
import type { GalleryPhoto } from '../../infra/socialApi';
import type { FeedPost } from '../../types';

export interface SocialResource<T> { data: T; loading: boolean; error: boolean }
function useResource<T>(load: () => Promise<T>, initial: T) {
  const [resource, setResource] = useState<SocialResource<T>>({
    data: initial,
    loading: true,
    error: false,
  });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setResource({ data: initial, loading: true, error: false });
    void load()
      .then(data => {
        if (active) setResource({ data, loading: false, error: false });
      })
      .catch(() => {
        if (active) setResource({ data: initial, loading: false, error: true });
      });
    return () => {
      active = false;
    };
    // Initial values are stable constants; changing a tenant always changes load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, version]);
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
  return {
    stories: useResource(loadStories, EMPTY_POSTS),
    gallery: useResource(loadGallery, EMPTY_GALLERY),
  };
}
