import React, { useState } from 'react';
import { LuCheck as Check, LuPlus as Plus, LuTrash2 as Trash } from 'react-icons/lu';
import { casesApi, type CaseTask } from '../../infra/casesApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { FIELD_CONTROL } from '../../components/ui/Field';
import type { StaffMember } from '../../types';
import { TASK_STATUS_LABELS, formatDate } from './caseLabels';
export interface TasksTabProps {
  caseId: string;
  tasks: CaseTask[];
  staff: StaffMember[];
  onChanged: () => void | Promise<void>;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

export const CaseTasksTab: React.FC<TasksTabProps> = ({ caseId, tasks, staff, onChanged, onNotify }) => {
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState('');
  const [saving, setSaving] = useState(false);

  const addTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await casesApi.createTask(caseId, {
        title: title.trim(),
        assigneeStaffId: assignee || null,
      });
      setTitle('');
      setAssignee('');
      await onChanged();
      onNotify?.('Tarefa criada.');
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (task: CaseTask) => {
    try {
      await casesApi.updateTask(caseId, task.id, {
        status: task.status === 'DONE' ? 'OPEN' : 'DONE',
      });
      await onChanged();
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  const removeTask = async (task: CaseTask) => {
    try {
      await casesApi.deleteTask(caseId, task.id);
      await onChanged();
    } catch (err) {
      onNotify?.(getErrorMessage(err), 'error');
    }
  };

  return (
    <section className="space-y-3">
      <form onSubmit={addTask} className="flex flex-wrap items-end gap-2">
        <label className="flex-1 min-w-[12rem] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Nova tarefa</span>
          <input
            className={FIELD_CONTROL}
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Ex.: Conferir petição inicial"
            aria-label="Título da tarefa"
          />
        </label>
        {staff.length > 0 && (
          <label className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Responsável</span>
            <select className={FIELD_CONTROL} value={assignee} onChange={event => setAssignee(event.target.value)} aria-label="Responsável pela tarefa">
              <option value="">Sem responsável</option>
              {staff.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg disabled:opacity-50"
        >
          <Plus size={14} /> Adicionar
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-4 text-center text-xs text-text-muted">
          Nenhuma tarefa registrada.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
              <button
                type="button"
                onClick={() => void toggleTask(task)}
                aria-label={task.status === 'DONE' ? 'Reabrir tarefa' : 'Concluir tarefa'}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${
                  task.status === 'DONE' ? 'border-success bg-success/15 text-success' : 'border-border text-text-muted'
                }`}
              >
                {task.status === 'DONE' && <Check size={13} />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-xs font-bold ${task.status === 'DONE' ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                  {task.title}
                </p>
                <p className="truncate text-[11px] text-text-muted">
                  {[TASK_STATUS_LABELS[task.status], task.assigneeName, task.dueDate ? `entrega ${formatDate(task.dueDate)}` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void removeTask(task)}
                aria-label={`Remover tarefa ${task.title}`}
                className="rounded-lg p-1.5 text-text-muted hover:bg-danger/10 hover:text-danger"
              >
                <Trash size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

