import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { FeedPost } from '../../types';
import type { PostEditorProps } from './PostEditor';
import { PostsManager } from './PostsManager';

const mocks = vi.hoisted(() => ({
  selection: { barbershopId: 'shop-1' as string | null, userId: 'user-1' },
  list: vi.fn(),
  palettes: vi.fn(),
  listMedia: vi.fn(),
  publish: vi.fn(),
  remove: vi.fn(),
  cancelSchedule: vi.fn(),
  whatsappAudience: vi.fn(),
  sendWhatsapp: vi.fn(),
}));
vi.mock('../../contexts/BarbershopFiltersContext', () => ({
  useBarbershopFilters: () => ({ barbershopId: mocks.selection.barbershopId }),
}));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: mocks.selection.userId } }),
}));
vi.mock('../../infra/postsApi', () => ({ postsApi: mocks }));
vi.mock('./PostEditor', () => ({
  PostEditor: (props: PostEditorProps) => (
    <div
      role="dialog"
      aria-label="Editor de teste"
      data-target-id={props.post?.id ?? ''}
      data-source-id={props.sourcePost?.id ?? ''}
      data-palette-count={props.palettes.length}
      data-media-count={props.mediaLibrary.length}
      data-metadata-errors={props.metadataErrors?.length ?? 0}
    >
      <button type="button" onClick={props.onClose}>
        Fechar editor de teste
      </button>
      <button type="button" onClick={props.onReloadMetadata} disabled={props.metadataLoading}>
        Recarregar mídia no editor de teste
      </button>
      <button type="button" onClick={() => props.onSaved('draft')}>
        Concluir rascunho de teste
      </button>
    </div>
  ),
}));

function post(overrides: Partial<FeedPost> = {}): FeedPost {
  return {
    id: 'post-1',
    barbershopId: 'shop-1',
    type: 'announcement',
    title: 'Post publicado',
    content: 'Legenda',
    imageUrl: 'https://cdn.example.com/post.png',
    createdAt: 1_790_000_000_000,
    likes: 0,
    status: 'published',
    format: 'square',
    ...overrides,
  };
}
function page(data: FeedPost[], total = data.length, current = 1) {
  return { data, meta: { total, page: current, limit: 12 } };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.selection.barbershopId = 'shop-1';
  mocks.selection.userId = 'user-1';
  mocks.list.mockResolvedValue(page([post()]));
  mocks.palettes.mockResolvedValue([{ key: 'brand', label: 'Marca' }]);
  mocks.listMedia.mockResolvedValue([]);
  mocks.remove.mockResolvedValue(undefined);
  mocks.cancelSchedule.mockResolvedValue(post({ status: 'draft' }));
  mocks.publish.mockResolvedValue(post());
  mocks.whatsappAudience.mockResolvedValue({
    eligible: 3,
    whatsappConnected: true,
    postPublished: true,
  });
  mocks.sendWhatsapp.mockResolvedValue({ queued: 3 });
});

describe('PostsManager — recuperação e isolamento da seleção', () => {
  it('mostra erro recuperável da lista sem apresentar uma falsa lista vazia', async () => {
    mocks.list.mockRejectedValueOnce(new Error('API indisponível'));
    render(<PostsManager />);
    expect(await screen.findByRole('alert')).toHaveTextContent('API indisponível');
    expect(screen.queryByText('Nenhum post publicado ainda.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar carregar posts novamente' }));
    expect(await screen.findByText('Post publicado')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('ignora a resposta da aba anterior quando ela chega depois da aba atual', async () => {
    const oldResponse = deferred<ReturnType<typeof page>>();
    mocks.list
      .mockReturnValueOnce(oldResponse.promise)
      .mockResolvedValueOnce(
        page([post({ id: 'scheduled', status: 'scheduled', title: 'Agendado atual' })])
      );
    render(<PostsManager />);
    fireEvent.click(screen.getByRole('tab', { name: 'Agendados' }));
    await screen.findByText('Agendado atual');
    await act(async () => oldResponse.resolve(page([post({ title: 'Resposta antiga' })])));
    expect(screen.queryByText('Resposta antiga')).not.toBeInTheDocument();
    expect(screen.getByText('Agendado atual')).toBeInTheDocument();
  });

  it('reinicia editor, biblioteca e lista ao trocar de salão', async () => {
    const oldMedia = deferred<never[]>();
    mocks.listMedia.mockReturnValueOnce(oldMedia.promise).mockResolvedValueOnce([]);
    const view = render(<PostsManager />);
    await screen.findByText('Post publicado');
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getByRole('dialog', { name: 'Editor de teste' })).toBeInTheDocument();
    mocks.selection.barbershopId = 'shop-2';
    mocks.list.mockResolvedValueOnce(
      page([post({ id: 'shop-2-post', barbershopId: 'shop-2', title: 'Post do segundo salão' })])
    );
    view.rerender(<PostsManager />);
    expect(screen.queryByRole('dialog', { name: 'Editor de teste' })).not.toBeInTheDocument();
    expect(screen.queryByText('Post publicado')).not.toBeInTheDocument();
    await screen.findByText('Post do segundo salão');
    await act(async () => oldMedia.resolve([]));
    expect(screen.getByText('Post do segundo salão')).toBeInTheDocument();
  });

  it('preserva as paletas quando a biblioteca falha e permite recarregar os metadados', async () => {
    mocks.listMedia
      .mockRejectedValueOnce(new Error('Biblioteca indisponível'))
      .mockResolvedValueOnce([
        {
          id: 'media-1',
          url: 'https://cdn.example.com/photo.png',
          mimeType: 'image/png',
          size: 1,
          createdAt: '',
        },
      ]);
    render(<PostsManager />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Biblioteca indisponível');
    fireEvent.click(screen.getByRole('button', { name: 'Criar post' }));
    expect(screen.getByRole('dialog', { name: 'Editor de teste' })).toHaveAttribute(
      'data-palette-count',
      '1'
    );
    expect(screen.getByRole('dialog', { name: 'Editor de teste' })).toHaveAttribute(
      'data-media-count',
      '0'
    );
    expect(screen.getByRole('dialog', { name: 'Editor de teste' })).toHaveAttribute(
      'data-metadata-errors',
      '1'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Recarregar mídia no editor de teste' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(screen.getByRole('dialog', { name: 'Editor de teste' })).toHaveAttribute(
      'data-media-count',
      '1'
    );
    expect(screen.getByRole('dialog', { name: 'Editor de teste' })).toHaveAttribute(
      'data-metadata-errors',
      '0'
    );
  });

  it('aguarda a seleção de salão sem disparar chamadas ou abrir editor', () => {
    mocks.selection.barbershopId = null;
    render(<PostsManager />);
    expect(screen.getByRole('status')).toHaveTextContent('Selecione um salão');
    expect(screen.queryByRole('button', { name: 'Criar post' })).not.toBeInTheDocument();
    expect(mocks.list).not.toHaveBeenCalled();
  });
});

describe('PostsManager — ações de posts', () => {
  it('reutiliza um publicado como fonte para um novo post, sem editar o original', async () => {
    render(<PostsManager />);
    await screen.findByText('Post publicado');
    fireEvent.click(screen.getByRole('button', { name: 'Reutilizar' }));
    const editor = screen.getByRole('dialog', { name: 'Editor de teste' });
    expect(editor).toHaveAttribute('data-target-id', '');
    expect(editor).toHaveAttribute('data-source-id', 'post-1');
    fireEvent.click(screen.getByRole('button', { name: 'Fechar editor de teste' }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getByRole('dialog', { name: 'Editor de teste' })).toHaveAttribute(
      'data-target-id',
      'post-1'
    );
    expect(screen.getByRole('dialog', { name: 'Editor de teste' })).toHaveAttribute(
      'data-source-id',
      ''
    );
  });

  it('cancela agendamento pela ação da linha e mostra o rascunho', async () => {
    mocks.list
      .mockResolvedValueOnce(page([]))
      .mockResolvedValueOnce(page([post({ status: 'scheduled', title: 'Post agendado' })]))
      .mockResolvedValueOnce(
        page([post({ status: 'draft', title: 'Post voltou para rascunhos' })])
      );
    render(<PostsManager />);
    await screen.findByText('Nenhum post publicado ainda.');
    fireEvent.click(screen.getByRole('tab', { name: 'Agendados' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar agendamento' }));
    await screen.findByText('Post voltou para rascunhos');
    expect(mocks.cancelSchedule).toHaveBeenCalledWith('post-1');
    expect(screen.getByRole('tab', { name: 'Rascunhos' })).toHaveAttribute('aria-selected', 'true');
  });

  it('recarrega a aba atual quando uma publicação iniciada em outra aba termina', async () => {
    const publication = deferred<FeedPost>();
    mocks.publish.mockReturnValueOnce(publication.promise);
    mocks.list.mockImplementation((_shop, options) =>
      Promise.resolve(
        page(
          options.status === 'draft'
            ? [post({ status: 'draft', title: 'Rascunho em publicação' })]
            : [post({ title: 'Publicação atual' })]
        )
      )
    );
    render(<PostsManager />);
    await screen.findByText('Publicação atual');
    fireEvent.click(screen.getByRole('tab', { name: 'Rascunhos' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Publicar' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Publicados' }));
    await screen.findByText('Publicação atual');
    await act(async () => publication.resolve(post()));
    await waitFor(() =>
      expect(mocks.list).toHaveBeenLastCalledWith(
        'shop-1',
        expect.objectContaining({ status: 'published' })
      )
    );
    expect(screen.getByRole('tab', { name: 'Publicados' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.queryByText('Rascunho em publicação')).not.toBeInTheDocument();
  });

  it('volta uma página ao excluir o único item da última página', async () => {
    mocks.list.mockImplementation((_shop, options) =>
      Promise.resolve(
        page(
          [
            post({
              status: 'draft',
              title: options.page === 2 ? 'Último rascunho' : 'Rascunho anterior',
              id: options.page === 2 ? 'last-draft' : 'first-draft',
            }),
          ],
          13,
          options.page
        )
      )
    );
    render(<PostsManager />);
    await screen.findByText('Rascunho anterior');
    fireEvent.click(screen.getByRole('tab', { name: 'Rascunhos' }));
    await screen.findByText('Rascunho anterior');
    fireEvent.click(screen.getByRole('button', { name: /Próxima/ }));
    const row = (await screen.findByText('Último rascunho')).closest('li')!;
    fireEvent.click(within(row).getByRole('button', { name: 'Excluir rascunho' }));
    fireEvent.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Excluir' })
    );
    await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith('last-draft'));
    await screen.findByText('Rascunho anterior');
    expect(mocks.list).toHaveBeenLastCalledWith(
      'shop-1',
      expect.objectContaining({ status: 'draft', page: 1 })
    );
  });

  it('mostra erro e retry da audiência no próprio modal em vez de spinner permanente', async () => {
    mocks.whatsappAudience.mockRejectedValueOnce(new Error('Não foi possível contar clientes'));
    render(<PostsManager />);
    await screen.findByText('Post publicado');
    fireEvent.click(screen.getByRole('button', { name: 'WhatsApp' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Não foi possível contar clientes'
    );
    expect(within(dialog).queryByText('Verificando clientes…')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Enviar agora' })).toBeDisabled();
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Tentar verificar clientes novamente' })
    );
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Enviar agora' })).toBeEnabled()
    );
    expect(mocks.sendWhatsapp).not.toHaveBeenCalled();
  });
});
