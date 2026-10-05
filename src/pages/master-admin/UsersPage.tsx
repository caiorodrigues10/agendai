import React, { useCallback, useEffect, useState } from 'react';
import { LuLoader, LuPencil, LuPlus, LuSearch, LuTrash2, LuTriangleAlert, LuUser } from 'react-icons/lu';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi, UserListItem } from '../../infra/adminApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PaginationBar } from '../../components/ui/PaginationBar';
import { Toast } from '../../components/ui/Toast';
import { FIELD_CONTROL } from '../../components/ui/Field';
import { UserFormDialog } from './UserFormDialog';

const PAGE_SIZE = 20;

const ROLE_LABELS: Record<string, string> = {
  MASTER_ADMIN: 'Master',
  OWNER: 'Dono',
  EMPLOYEE: 'Funcionário',
  CUSTOMER: 'Cliente',
};

interface UsersMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const SELECT_CLASS =
  'rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary focus:outline-none focus:border-accent';

interface UsersFiltersProps {
  search: string;
  role: string;
  active: string;
  onSearch: (value: string) => void;
  onRole: (value: string) => void;
  onActive: (value: string) => void;
}

const UsersFilters: React.FC<UsersFiltersProps> = ({ search, role, active, onSearch, onRole, onActive }) => (
  <div className="flex flex-wrap items-center gap-3">
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get('q');
        onSearch(typeof value === 'string' ? value.trim() : '');
      }}
      className="relative min-w-[220px] flex-1"
    >
      <LuSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
      <input
        type="search"
        name="q"
        placeholder="Buscar por nome ou e-mail..."
        aria-label="Buscar usuários"
        defaultValue={search}
        className={`${FIELD_CONTROL} pl-9`}
      />
    </form>
    <select aria-label="Papel" value={role} onChange={(e) => onRole(e.target.value)} className={SELECT_CLASS}>
      <option value="">Todos os papéis</option>
      <option value="MASTER_ADMIN">Master</option>
      <option value="OWNER">Dono</option>
      <option value="EMPLOYEE">Funcionário</option>
    </select>
    <select
      aria-label="Status"
      value={active}
      onChange={(e) => onActive(e.target.value)}
      className={SELECT_CLASS}
    >
      <option value="">Todos</option>
      <option value="true">Ativos</option>
      <option value="false">Inativos</option>
    </select>
  </div>
);

interface UserRowProps {
  item: UserListItem;
  isSelf: boolean;
  onEdit: (item: UserListItem) => void;
  onDelete: (item: UserListItem) => void;
}

const UserRow: React.FC<UserRowProps> = ({ item, isSelf, onEdit, onDelete }) => (
  <div data-testid="user-row" className="flex items-center gap-4 px-4 py-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
      {item.name.charAt(0).toUpperCase()}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium">
        {item.name}
        {isSelf && <span className="ml-2 text-xs text-text-muted">(você)</span>}
      </p>
      <p className="truncate text-xs text-text-muted">{item.email}</p>
    </div>
    <span className="hidden shrink-0 rounded bg-hover-bg px-2 py-0.5 text-xs text-text-secondary sm:inline">
      {ROLE_LABELS[item.role] ?? item.role}
    </span>
    <span className="hidden max-w-[160px] truncate text-xs text-text-muted md:inline">
      {item.barbershop?.name ?? 'Sem salão'}
    </span>
    <span
      className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
        item.active ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
      }`}
    >
      {item.active ? 'Ativo' : 'Inativo'}
    </span>
    <div className="flex shrink-0 gap-1">
      <button
        type="button"
        aria-label={`Editar ${item.name}`}
        onClick={() => onEdit(item)}
        className="rounded-lg p-2 text-text-muted hover:bg-hover-bg hover:text-text-primary"
      >
        <LuPencil size={15} />
      </button>
      <button
        type="button"
        aria-label={`Excluir ${item.name}`}
        disabled={isSelf}
        title={isSelf ? 'Você não pode excluir a própria conta.' : undefined}
        onClick={() => onDelete(item)}
        className="rounded-lg p-2 text-text-muted hover:bg-hover-bg hover:text-danger disabled:opacity-40 disabled:hover:bg-transparent"
      >
        <LuTrash2 size={15} />
      </button>
    </div>
  </div>
);

export const UsersPage: React.FC = () => {
  const { user: self } = useAuth();
  const [response, setResponse] = useState<{ data: UserListItem[]; meta: UsersMeta } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [active, setActive] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [dialog, setDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; user: UserListItem | null }>(
    { open: false, mode: 'create', user: null },
  );
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let activeRequest = true;
    adminApi
      .listUsers({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        role: role || undefined,
        active: active === '' ? undefined : active === 'true',
      })
      .then((res) => {
        if (!activeRequest) return;
        setResponse({ data: res.data, meta: res.meta });
        setLoadError(null);
      })
      .catch((err) => {
        if (!activeRequest) return;
        setLoadError(getErrorMessage(err, 'Não foi possível carregar os usuários.'));
      });
    return () => {
      activeRequest = false;
    };
  }, [page, search, role, active, reloadKey]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setToast({ message: 'Usuário excluído.', type: 'success' });
      setDeleteTarget(null);
      reload();
    } catch (err) {
      setToast({ message: getErrorMessage(err, 'Não foi possível excluir o usuário.'), type: 'error' });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const loading = !response && !loadError;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LuLoader className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  const meta = response?.meta;
  const users = response?.data ?? [];

  return (
    <div className="space-y-4" data-testid="users-page">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <LuUser size={20} /> Usuários
        </h1>
        <Button
          type="button"
          size="sm"
          onClick={() => setDialog({ open: true, mode: 'create', user: null })}
        >
          <LuPlus size={16} /> Novo usuário
        </Button>
      </div>

      <UsersFilters
        search={search}
        role={role}
        active={active}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onRole={(value) => {
          setRole(value);
          setPage(1);
        }}
        onActive={(value) => {
          setActive(value);
          setPage(1);
        }}
      />

      {loadError && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
          <LuTriangleAlert size={16} />
          {loadError}
          <button type="button" onClick={reload} className="ml-auto text-xs underline">
            Tentar novamente
          </button>
        </div>
      )}

      <div className="divide-y divide-border/50 overflow-hidden rounded-xl border border-border bg-surface">
        {users.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-text-muted">
            Nenhum usuário encontrado com estes filtros.
          </p>
        ) : (
          users.map((item) => (
            <UserRow
              key={item.id}
              item={item}
              isSelf={item.id === self?.id}
              onEdit={(target) => setDialog({ open: true, mode: 'edit', user: target })}
              onDelete={(target) => setDeleteTarget(target)}
            />
          ))
        )}
      </div>

      {meta && (
        <div className="flex items-center justify-between gap-3 text-sm text-text-muted">
          <span>
            {meta.total} resultado(s) · página {meta.page} de {Math.max(meta.totalPages, 1)}
          </span>
          <PaginationBar
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={(next) => setPage(next)}
          />
        </div>
      )}

      {dialog.open && (
        <UserFormDialog
          open={dialog.open}
          mode={dialog.mode}
          user={dialog.user}
          selfUserId={self?.id ?? ''}
          onClose={() => setDialog((prev) => ({ ...prev, open: false }))}
          onSaved={() => {
            setDialog((prev) => ({ ...prev, open: false }));
            setToast({
              message: dialog.mode === 'create' ? 'Usuário criado.' : 'Usuário atualizado.',
              type: 'success',
            });
            reload();
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Excluir usuário"
        message={`Excluir o usuário ${deleteTarget?.name ?? ''}? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default UsersPage;
