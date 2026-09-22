/// <reference types="vitest/globals" />
import { decodeGoogleCredential } from './googleCredential';

function makeToken(payload: object): string {
  const encode = (value: string) =>
    btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encode('{"alg":"HS256"')}.${encode(JSON.stringify(payload))}.sig`;
}

describe('decodeGoogleCredential', () => {
  it('decodifica payload com base64url (sem - ou _)', () => {
    const token = makeToken({
      email: 'user@example.com',
      name: 'John Doe',
      given_name: 'John',
      family_name: 'Doe',
    });
    expect(decodeGoogleCredential(token)).toEqual({
      email: 'user@example.com',
      name: 'John Doe',
      given_name: 'John',
      family_name: 'Doe',
    });
  });

  it('decodifica payload com caracteres base64url - e _', () => {
    const raw = JSON.stringify({
      email: 'a??@example.com',
      name: '??? >> ??',
      given_name: '???',
      family_name: '???',
    });
    const b64url = btoa(raw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(b64url).toMatch(/[-_]/);
    const token = `eyJhbGciOiJIUzI1NiJ9.${b64url}.sig`;
    const claims = decodeGoogleCredential(token);
    expect(claims.email).toBe('a??@example.com');
    expect(claims.name).toBe('??? >> ??');
  });

  it('retorna payload sem padding base64', () => {
    const encode = (value: string) =>
      btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const payload = { email: 'x@y.z' };
    const token = `${encode('a')}.${encode(JSON.stringify(payload))}.c`;
    expect(decodeGoogleCredential(token).email).toBe('x@y.z');
  });

  it('retorna objeto vazio para token inválido', () => {
    expect(decodeGoogleCredential('not-a-token')).toEqual({});
    expect(decodeGoogleCredential('')).toEqual({});
    expect(decodeGoogleCredential('a.@@@.c')).toEqual({});
  });
});
