import React, { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Loader2,
  Trash2,
  GripVertical,
  FileText,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  List,
  Eye,
} from 'lucide-react';
import { formsApi, Form, FormField, FormResponse } from '../../infra/formsApi';
import { useBarbershopFilters } from '../../contexts/BarbershopFiltersContext';
import { getErrorMessage } from '../../utils/errorMessage';
import { Field, FIELD_CONTROL, FORM_FOOTER } from '../ui/Field';
import { SmartSelect } from '../ui/SmartSelect';

const FIELD_TYPES = ['TEXT', 'TEXTAREA', 'EMAIL', 'PHONE', 'NUMBER', 'SELECT', 'CHECKBOX', 'RADIO'];

const FIELD_TYPE_LABELS: Record<string, string> = {
  TEXT: 'Texto curto',
  TEXTAREA: 'Texto longo',
  EMAIL: 'E-mail',
  PHONE: 'Telefone',
  NUMBER: 'Número',
  SELECT: 'Seleção',
  CHECKBOX: 'Checkbox',
  RADIO: 'Rádio',
};

export const FormsPanel: React.FC = () => {
  const { barbershopId } = useBarbershopFilters();

  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState<Form | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [updating, setUpdating] = useState(false);

  // Field management
  const [expandedFormId, setExpandedFormId] = useState<string | null>(null);
  const [showAddField, setShowAddField] = useState<string | null>(null);
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('TEXT');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState('');
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [addingField, setAddingField] = useState(false);

  // Response viewer
  const [viewingResponses, setViewingResponses] = useState<string | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  const loadForms = useCallback(async () => {
    if (!barbershopId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await formsApi.list(barbershopId);
      setForms(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [barbershopId]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  const handleCreate = async () => {
    if (!barbershopId || !newTitle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const form = await formsApi.create(barbershopId, {
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      });
      setForms(prev => [form, ...prev]);
      setShowCreate(false);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!barbershopId || !editForm) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await formsApi.update(barbershopId, editForm.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
      setForms(prev => prev.map(f => (f.id === updated.id ? { ...f, ...updated } : f)));
      setEditForm(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (form: Form) => {
    if (!barbershopId) return;
    const newStatus = form.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await formsApi.update(barbershopId, form.id, { status: newStatus });
      setForms(prev => prev.map(f => (f.id === form.id ? { ...f, ...updated } : f)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (formId: string) => {
    if (!barbershopId) return;
    try {
      await formsApi.remove(barbershopId, formId);
      setForms(prev => prev.filter(f => f.id !== formId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleAddField = async (formId: string) => {
    if (!barbershopId || !fieldLabel.trim()) return;
    setAddingField(true);
    setError(null);
    try {
      const options = fieldOptions
        .split('\n')
        .map(o => o.trim())
        .filter(Boolean);
      const field = await formsApi.addField(barbershopId, formId, {
        label: fieldLabel.trim(),
        type: fieldType,
        required: fieldRequired,
        options: options.length ? options : undefined,
        placeholder: fieldPlaceholder.trim() || undefined,
      });
      setForms(prev =>
        prev.map(f =>
          f.id === formId ? { ...f, fields: [...f.fields, field] } : f
        )
      );
      setShowAddField(null);
      setFieldLabel('');
      setFieldType('TEXT');
      setFieldRequired(false);
      setFieldOptions('');
      setFieldPlaceholder('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAddingField(false);
    }
  };

  const handleRemoveField = async (formId: string, fieldId: string) => {
    if (!barbershopId) return;
    try {
      await formsApi.removeField(barbershopId, formId, fieldId);
      setForms(prev =>
        prev.map(f =>
          f.id === formId ? { ...f, fields: f.fields.filter(fl => fl.id !== fieldId) } : f
        )
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleViewResponses = async (formId: string) => {
    if (!barbershopId) return;
    setViewingResponses(formId);
    setResponsesLoading(true);
    try {
      const data = await formsApi.listResponses(barbershopId, formId);
      setResponses(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setResponses([]);
    } finally {
      setResponsesLoading(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-text-primary">Formulários</h3>
        <button
          onClick={() => { setShowCreate(!showCreate); setEditForm(null); }}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg"
        >
          <Plus size={16} />
          Criar formulário
        </button>
      </div>

      {error && <p className="text-xs text-error">{error}</p>}

      {/* Create form */}
      {showCreate && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <Field label="Título *">
            <input
              type="text"
              placeholder="Ex: Avaliação de atendimento"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className={FIELD_CONTROL}
            />
          </Field>
          <Field label="Descrição (opcional)">
            <textarea
              placeholder="Descrição do formulário"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              rows={2}
              className={`${FIELD_CONTROL} resize-none`}
            />
          </Field>
          <div className={FORM_FOOTER}>
            <button
              onClick={() => void handleCreate()}
              disabled={creating || !newTitle.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {creating ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
              Criar
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Forms list */}
      {forms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
          <FileText size={32} className="mx-auto text-text-muted" />
          <p className="mt-2 text-sm text-text-secondary">Nenhum formulário criado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map(form => (
            <div key={form.id} className="rounded-2xl border border-border bg-surface overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 p-3">
                <button
                  onClick={() => setExpandedFormId(expandedFormId === form.id ? null : form.id)}
                  className="rounded-lg p-1 text-text-muted hover:bg-surface-2"
                >
                  {expandedFormId === form.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text-primary">{form.title}</p>
                  <p className="text-xs text-text-muted">
                    {form.fields.length} campo{form.fields.length !== 1 ? 's' : ''}
                    {form.description && ` · ${form.description}`}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    form.status === 'ACTIVE'
                      ? 'bg-success/15 text-success'
                      : 'bg-surface-2 text-text-muted'
                  }`}
                >
                  {form.status}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { handleViewResponses(form.id); }}
                    className="rounded-lg p-2 text-text-muted hover:bg-surface-2"
                    title="Ver respostas"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => { setEditForm(form); setEditTitle(form.title); setEditDescription(form.description || ''); setShowCreate(false); }}
                    className="rounded-lg px-2 py-1 text-[10px] font-bold text-text-secondary hover:bg-surface-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => void handleToggleStatus(form)}
                    className="rounded-lg px-2 py-1 text-[10px] font-bold text-text-secondary hover:bg-surface-2"
                  >
                    {form.status === 'ACTIVE' ? 'Desativar' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => void handleDelete(form.id)}
                    className="rounded-lg p-2 text-text-muted hover:bg-error/10 hover:text-error"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded: fields */}
              {expandedFormId === form.id && (
                <div className="border-t border-border bg-bg p-3 space-y-2">
                  {form.fields.length === 0 ? (
                    <p className="text-xs text-text-muted py-2">Nenhum campo adicionado.</p>
                  ) : (
                    <div className="space-y-1">
                      {form.fields.map((field, idx) => (
                        <div key={field.id} className="flex items-center gap-2 rounded-lg bg-surface p-2">
                          <GripVertical size={12} className="text-text-muted" />
                          <span className="text-[10px] font-bold text-text-muted w-16 shrink-0">
                            {FIELD_TYPE_LABELS[field.type] || field.type}
                          </span>
                          <span className="text-xs text-text-primary flex-1">{field.label}</span>
                          {field.required && (
                            <span className="text-[10px] text-error font-bold">obrigatório</span>
                          )}
                          <button
                            onClick={() => void handleRemoveField(form.id, field.id)}
                            className="rounded p-1 text-text-muted hover:bg-error/10 hover:text-error"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add field form */}
                  {showAddField === form.id ? (
                    <div className="mt-2 rounded-xl border border-border bg-surface p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Rótulo do campo"
                          value={fieldLabel}
                          onChange={e => setFieldLabel(e.target.value)}
                          className="rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                        />
                        <SmartSelect
                          value={fieldType}
                          onChange={val => val && setFieldType(val)}
                          options={FIELD_TYPES.map(t => ({ value: t, label: FIELD_TYPE_LABELS[t] }))}
                          clearable={false}
                        />
                      </div>
                      {(fieldType === 'SELECT' || fieldType === 'RADIO') && (
                        <textarea
                          placeholder="Opções (uma por linha)"
                          value={fieldOptions}
                          onChange={e => setFieldOptions(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none resize-none"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Placeholder (opcional)"
                        value={fieldPlaceholder}
                        onChange={e => setFieldPlaceholder(e.target.value)}
                        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                      />
                      <label className="flex items-center gap-2 text-xs text-text-secondary">
                        <input
                          type="checkbox"
                          checked={fieldRequired}
                          onChange={e => setFieldRequired(e.target.checked)}
                          className="rounded border-border"
                        />
                        Obrigatório
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => void handleAddField(form.id)}
                          disabled={addingField || !fieldLabel.trim()}
                          className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-[10px] font-bold text-accent-fg disabled:opacity-50"
                        >
                          {addingField ? <Loader2 className="animate-spin" size={10} /> : <Plus size={10} />}
                          Adicionar
                        </button>
                        <button
                          onClick={() => setShowAddField(null)}
                          className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-bold text-text-secondary hover:bg-surface-2"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddField(form.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-2 text-[10px] font-bold text-text-muted hover:bg-surface-2"
                    >
                      <Plus size={12} />
                      Adicionar campo
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit form modal */}
      {editForm && (
        <div className="rounded-2xl border border-accent bg-surface p-4 space-y-3">
          <h4 className="text-sm font-bold text-text-primary">Editar formulário</h4>
          <Field label="Título *">
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className={FIELD_CONTROL}
            />
          </Field>
          <Field label="Descrição">
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              rows={2}
              className={`${FIELD_CONTROL} resize-none`}
            />
          </Field>
          <div className={FORM_FOOTER}>
            <button
              onClick={() => void handleUpdate()}
              disabled={updating || !editTitle.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-accent-fg disabled:opacity-50"
            >
              {updating ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
              Salvar
            </button>
            <button
              onClick={() => setEditForm(null)}
              className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Responses viewer */}
      {viewingResponses && (
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-text-primary">
              Respostas — {forms.find(f => f.id === viewingResponses)?.title}
            </h4>
            <button onClick={() => { setViewingResponses(null); setResponses([]); }} className="text-text-muted hover:text-text-primary">
              <X size={16} />
            </button>
          </div>
          {responsesLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="animate-spin text-accent" size={20} />
            </div>
          ) : responses.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">Nenhuma resposta recebida.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {responses.map(resp => (
                <div key={resp.id} className="rounded-xl border border-border bg-bg p-3 space-y-1">
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>{resp.respondentName || 'Anônimo'}</span>
                    <span>{formatDate(resp.submittedAt)}</span>
                  </div>
                  {Object.entries(resp.answers).map(([key, val]) => (
                    <div key={key} className="text-xs">
                      <span className="text-text-secondary">{key}: </span>
                      <span className="text-text-primary">{String(val)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
