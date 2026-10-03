import { useCallback, useEffect, useState } from 'react';
import { socialApi, type TaggedPost } from '../../infra/socialApi';
import { reputationApi, type PublicReviewSummary } from '../../infra/reputationApi';
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
const EMPTY_TAGS: TaggedPost[] = [];
export function useSalonSocial(salonId: string | null | undefined, canModerate: boolean) {
  const loadStories = useCallback(
    () => (salonId ? socialApi.stories(salonId) : Promise.resolve(EMPTY_POSTS)),
    [salonId]
  );
  const loadReviews = useCallback(
    () => (salonId ? reputationApi.getPublicSummary(salonId) : Promise.resolve(null)),
    [salonId]
  );
  const loadTags = useCallback(
    () => (salonId ? socialApi.tagged(salonId) : Promise.resolve(EMPTY_TAGS)),
    [salonId]
  );
  const loadPending = useCallback(
    () => (salonId && canModerate ? socialApi.tagged(salonId, true) : Promise.resolve(EMPTY_TAGS)),
    [salonId, canModerate]
  );
  return {
    stories: useResource(loadStories, EMPTY_POSTS),
    reviews: useResource<PublicReviewSummary | null>(loadReviews, null),
    tagged: useResource(loadTags, EMPTY_TAGS),
    pending: useResource(loadPending, EMPTY_TAGS),
  };
}
