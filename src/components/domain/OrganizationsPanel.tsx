import { useCallback, useEffect, useState } from "react";
import { organizationsApi, Organization } from "@/infra/organizationsApi";

export function OrganizationsPanel() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selected, setSelected] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", logoUrl: "" });

  const loadOrgs = useCallback(async () => {
    try {
      const data = await organizationsApi.listMy();
      setOrgs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrgs();
  }, [loadOrgs]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const org = await organizationsApi.create({
      name: form.name,
      slug: form.slug,
      logoUrl: form.logoUrl || undefined,
    });
    setOrgs((prev) => [org, ...prev]);
    setShowCreate(false);
    setForm({ name: "", slug: "", logoUrl: "" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir organização?")) return;
    await organizationsApi.delete(id);
    setOrgs((prev) => prev.filter((o) => o.id !== id));
    setSelected(null);
  }

  if (loading) return <div className="p-4 text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Organizações</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          + Nova
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="p-4 bg-gray-50 rounded-lg space-y-3">
          <input
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            required
          />
          <input
            placeholder="slug"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            required
          />
          <input
            placeholder="Logo URL (opcional)"
            value={form.logoUrl}
            onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm">
              Criar
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-gray-600 text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {orgs.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhuma organização encontrada.</p>
      ) : (
        <div className="space-y-2">
          {orgs.map((org) => (
            <div
              key={org.id}
              className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                selected?.id === org.id ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setSelected(selected?.id === org.id ? null : org)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{org.name}</span>
                  <span className="text-gray-400 text-xs ml-2">/{org.slug}</span>
                </div>
                <span className="text-xs text-gray-500">{org.barbershops?.length ?? 0} salões</span>
              </div>

              {selected?.id === org.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <p className="text-xs text-gray-500">
                    {org.members?.length ?? 0} membros
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(org.id);
                    }}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
