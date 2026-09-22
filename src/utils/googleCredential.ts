export interface GoogleCredentialClaims {
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
}

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(base64 + padding);
}

export function decodeGoogleCredential(idToken: string): GoogleCredentialClaims {
  try {
    const payloadSegment = idToken.split('.')[1] ?? '';
    return JSON.parse(base64UrlDecode(payloadSegment)) as GoogleCredentialClaims;
  } catch {
    return {};
  }
}
