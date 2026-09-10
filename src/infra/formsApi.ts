import { apiClient } from './apiClient';
import { authStorage } from './authStorage';

function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in res) return (res as { data: T }).data;
  return res as T;
}

function token() {
  return authStorage.getAccessToken() || '';
}

export interface FormField {
  id: string;
  formId: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Form {
  id: string;
  barbershopId: string;
  title: string;
  description?: string;
  status: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  respondentName?: string;
  respondentPhone?: string;
  respondentEmail?: string;
  answers: Record<string, unknown>;
  submittedAt: string;
  createdAt: string;
}

export const formsApi = {
  list: (barbershopId: string, params?: { status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return apiClient<{ data: Form[] }>(
      `/api/barbershops/${barbershopId}/forms${query ? '?' + query : ''}`,
      'GET', undefined, token()
    ).then(r => unwrap<Form[]>(r));
  },

  getById: (barbershopId: string, formId: string) =>
    apiClient<{ data: Form }>(
      `/api/barbershops/${barbershopId}/forms/${formId}`,
      'GET', undefined, token()
    ).then(r => unwrap<Form>(r)),

  create: (barbershopId: string, data: { title: string; description?: string }) =>
    apiClient<{ data: Form }>(
      `/api/barbershops/${barbershopId}/forms`,
      'POST', data, token()
    ).then(r => unwrap<Form>(r)),

  update: (barbershopId: string, formId: string, data: { title?: string; description?: string; status?: string }) =>
    apiClient<{ data: Form }>(
      `/api/barbershops/${barbershopId}/forms/${formId}`,
      'PATCH', data, token()
    ).then(r => unwrap<Form>(r)),

  remove: (barbershopId: string, formId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/forms/${formId}`,
      'DELETE', undefined, token()
    ),

  addField: (barbershopId: string, formId: string, data: { label: string; type: string; required?: boolean; options?: string[]; placeholder?: string; position?: number }) =>
    apiClient<{ data: FormField }>(
      `/api/barbershops/${barbershopId}/forms/${formId}/fields`,
      'POST', data, token()
    ).then(r => unwrap<FormField>(r)),

  updateField: (barbershopId: string, formId: string, fieldId: string, data: { label?: string; type?: string; required?: boolean; options?: string[]; placeholder?: string; position?: number }) =>
    apiClient<{ data: FormField }>(
      `/api/barbershops/${barbershopId}/forms/${formId}/fields/${fieldId}`,
      'PATCH', data, token()
    ).then(r => unwrap<FormField>(r)),

  removeField: (barbershopId: string, formId: string, fieldId: string) =>
    apiClient<{ success: boolean }>(
      `/api/barbershops/${barbershopId}/forms/${formId}/fields/${fieldId}`,
      'DELETE', undefined, token()
    ),

  submitResponse: (barbershopId: string, formId: string, data: { respondentName?: string; respondentPhone?: string; respondentEmail?: string; answers: Record<string, unknown> }) =>
    apiClient<{ data: FormResponse }>(
      `/api/barbershops/${barbershopId}/forms/${formId}/responses`,
      'POST', data, token()
    ).then(r => unwrap<FormResponse>(r)),

  listResponses: (barbershopId: string, formId: string) =>
    apiClient<{ data: FormResponse[] }>(
      `/api/barbershops/${barbershopId}/forms/${formId}/responses`,
      'GET', undefined, token()
    ).then(r => unwrap<FormResponse[]>(r)),
};
