// Storage de rascunho de post (localStorage), compartilhado entre PostEditor e
// PostsManager. A key é única por usuário+salão+post; o campo `version` do envelope
// discrimina o schema do payload (PostEditor grava v2, payloads legados v1).

export interface DraftEnvelope {
  version: number;
  savedAt: number;
}

export function draftKey(userId: string, barbershopId: string, postId: string | 'new'): string {
  return `agendai:post-draft:${userId}:${barbershopId}:${postId}`;
}

export function readDraft<T extends DraftEnvelope>(
  userId: string,
  barbershopId: string,
  postId: string | 'new',
  expectedVersion: number,
): T | null {
  try {
    const raw = localStorage.getItem(draftKey(userId, barbershopId, postId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as T;
    return parsed.version === expectedVersion ? parsed : null;
  } catch {
    return null;
  }
}

export function writeDraft<T extends DraftEnvelope>(
  userId: string,
  barbershopId: string,
  postId: string | 'new',
  version: number,
  data: Omit<T, 'version' | 'savedAt'>,
): void {
  try {
    localStorage.setItem(
      draftKey(userId, barbershopId, postId),
      JSON.stringify({ version, savedAt: Date.now(), ...data }),
    );
  } catch {
    /* storage full — ignore */
  }
}

export function clearDraft(userId: string, barbershopId: string, postId: string | 'new'): void {
  try {
    localStorage.removeItem(draftKey(userId, barbershopId, postId));
  } catch {
    /* noop */
  }
}
