/**
 * Helper de teste — simula uma origem **sem contexto seguro**.
 *
 * `crypto.randomUUID()` só é exposto em contexto seguro (HTTPS ou loopback).
 * Em `http://` não-loopback a propriedade não existe, e qualquer código que a
 * chame sem guarda quebra. Nos testes, remover a propriedade reproduz esse
 * ambiente sem precisar de um servidor http:// real.
 */
export async function withoutRandomUuid<T>(run: () => T | Promise<T>): Promise<T> {
  const original = Object.getOwnPropertyDescriptor(crypto, 'randomUUID');

  Object.defineProperty(crypto, 'randomUUID', {
    configurable: true,
    value: undefined,
  });

  try {
    return await run();
  } finally {
    if (original) {
      Object.defineProperty(crypto, 'randomUUID', original);
    } else {
      // A implementação original vive no prototype: basta remover a sombra.
      delete (crypto as unknown as Record<string, unknown>).randomUUID;
    }
  }
}
