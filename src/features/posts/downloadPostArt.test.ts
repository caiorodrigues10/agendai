import { downloadPostArt } from './downloadPostArt';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); });

it('baixa a arte hospedada usando blob e mantém a extensão do formato real', async () => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['image'], { type: 'image/jpeg' }) }));
  const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:post-art');
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  const clicked: { href: string; filename: string }[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () { clicked.push({ href: this.href, filename: this.download }); });
  await downloadPostArt('https://cdn.example.com/post.jpg', 'post.png');
  expect(create).toHaveBeenCalledWith(expect.any(Blob));
  expect(clicked).toEqual([{ href: 'blob:post-art', filename: 'post.jpg' }]);
  vi.runAllTimers();
  expect(revoke).toHaveBeenCalledWith('blob:post-art');
});

it('informa falhas de download em vez de salvar um erro como arquivo de imagem', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
  await expect(downloadPostArt('https://cdn.example.com/missing.png', 'post.png')).rejects.toThrow('Não foi possível baixar');
  vi.mocked(fetch).mockResolvedValue({ ok: true, blob: async () => new Blob(['erro'], { type: 'application/json' }) } as Response);
  await expect(downloadPostArt('https://cdn.example.com/error', 'post.png')).rejects.toThrow('não está disponível como imagem');
});
