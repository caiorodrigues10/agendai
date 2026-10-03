/**
 * Sessão de impersonation do master — SOMENTE em memória (nunca localStorage):
 * - recarregou a aba, a sessão temporária acabou (a do master continua intacta);
 * - expira em `expiresAt` (30 min, definido pelo backend).
 */
export interface ImpersonationShop {
  id: string;
  name: string;
}

export interface ImpersonationSession {
  accessToken: string;
  expiresAt: number;
  shop: ImpersonationShop;
}

export interface ImpersonationStartPayload {
  accessToken: string;
  expiresIn: number;
  user: unknown;
  shop: ImpersonationShop;
}

let session: ImpersonationSession | null = null;

function read(): ImpersonationSession | null {
  if (session && session.expiresAt <= Date.now()) {
    session = null;
    return null;
  }
  return session;
}

export const impersonationStorage = {
  start(payload: ImpersonationStartPayload): void {
    session = {
      accessToken: payload.accessToken,
      expiresAt: Date.now() + payload.expiresIn * 1000,
      shop: payload.shop,
    };
  },
  clear(): void {
    session = null;
  },
  get(): ImpersonationSession | null {
    return read();
  },
  isActive(): boolean {
    return read() !== null;
  },
  /** Segundos restantes da sessão temporária (0 quando expirada). */
  secondsLeft(): number {
    const current = read();
    if (!current) return 0;
    return Math.max(0, Math.ceil((current.expiresAt - Date.now()) / 1000));
  },
};
