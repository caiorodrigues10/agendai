import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Field } from '../../components/ui/Field';
import type { LegalPostPayload } from '../../types';

export const legalPostSchema = z.object({
  professionalName: z.string().trim().min(1, 'Informe o nome profissional.').max(90, 'Use até 90 caracteres no nome.'),
  registration: z.string().trim().min(1, 'Informe a inscrição na OAB.').max(40, 'Use até 40 caracteres na inscrição.'),
  areas: z.array(z.object({ title: z.string().trim().min(1, 'Complete ou remova este bloco.').max(50, 'Use até 50 caracteres no título do bloco.'), description: z.string().trim().max(140, 'Use até 140 caracteres na descrição.') })).max(4),
  eyebrow: z.string().trim().max(40, 'Use até 40 caracteres na seção.').optional(),
  summary: z.string().trim().max(160, 'Use até 160 caracteres no texto principal.').optional(),
  highlight: z.string().trim().max(60, 'Use até 60 caracteres no destaque.').optional(),
  contact: z.string().trim().max(40, 'Use até 40 caracteres no contato.').optional(),
  address: z.string().trim().max(100, 'Use até 100 caracteres no endereço.').optional(),
  website: z.string().trim().max(80, 'Use até 80 caracteres no site ou e-mail.').optional(),
  contactLayout: z.enum(['essential', 'complete']).optional(),
});

const OPTIONAL_BLOCK_MODELS = new Set(['advocacia-trabalhista', 'advocacia-perfil', 'advocacia-comunicado', 'advocacia-contratos']);

export function legalPostSchemaFor(templateKey: string) {
  return legalPostSchema.superRefine((data, context) => {
    if (templateKey === 'advocacia-trabalhista' && !data.summary && !data.highlight) {
      context.addIssue({ code: 'custom', path: ['summary'], message: 'Escreva a resposta no texto principal ou no destaque.' });
    } else if (templateKey === 'advocacia-comunicado' && !data.highlight) {
      context.addIssue({ code: 'custom', path: ['highlight'], message: 'Informe a data ou o período do aviso.' });
    } else if (templateKey === 'advocacia-perfil' && !data.summary && !data.areas.length) {
      context.addIssue({ code: 'custom', path: ['summary'], message: 'Apresente o profissional no texto principal ou em um bloco.' });
    } else if (templateKey === 'advocacia-contratos' && !data.summary && !data.areas.length) {
      context.addIssue({ code: 'custom', path: ['summary'], message: 'Inclua um tema no texto principal ou uma orientação de participação.' });
    } else if (!OPTIONAL_BLOCK_MODELS.has(templateKey) && !data.areas.length) {
      context.addIssue({ code: 'custom', path: ['areas'], message: 'Adicione ao menos um bloco de conteúdo.' });
    }
  });
}

interface LegalModelFields {
  heading: string;
  help: string;
  block: string;
  title: string;
  description: string;
  example: string;
  add: string;
  highlight?: string;
  summary?: string;
  summaryHint?: string;
}

const MODEL_FIELDS: Record<string, LegalModelFields> = {
  'advocacia-cartao': {
    heading: 'Identidade do escritório', help: 'Apresente o escritório e os pontos que devem acompanhar sua identificação profissional.',
    block: 'Destaque', title: 'Destaque do escritório', description: 'Descrição do destaque', example: 'Ex.: Atendimento com horário marcado', add: 'Adicionar destaque',
  },
  'advocacia-areas': {
    heading: 'Mapa de atuação', help: 'Organize os assuntos atendidos em até quatro áreas, com uma descrição curta para cada uma.',
    block: 'Área', title: 'Área de atuação', description: 'Descrição da área', example: 'Ex.: Direito do consumidor', add: 'Adicionar área',
  },
  'advocacia-trabalhista': {
    heading: 'Pergunta e resposta', help: 'Use o título do post como pergunta e o Texto principal como resposta. Acrescente orientações curtas nos blocos.',
    block: 'Orientação', title: 'Orientação de apoio', description: 'Explicação', example: 'Ex.: Separe os registros', add: 'Adicionar orientação',
    summary: 'Resposta à pergunta', summaryHint: 'Escreva uma resposta objetiva aqui ou no campo Destaque. Pelo menos uma resposta é necessária para publicar.',
  },
  'advocacia-consumidor': {
    heading: 'Checklist de contratos', help: 'Liste pontos de leitura que ajudem a organizar dúvidas sobre um contrato.',
    block: 'Item', title: 'Item do checklist', description: 'Orientação do item', example: 'Ex.: Guarde os comprovantes', add: 'Adicionar item ao checklist',
  },
  'advocacia-familia': {
    heading: 'Etapas de contratação', help: 'Descreva o contato, o alinhamento do serviço e a proposta conforme o processo do seu escritório.',
    block: 'Etapa', title: 'Nome da etapa', description: 'O que acontece nesta etapa', example: 'Ex.: Primeira conversa', add: 'Adicionar etapa',
  },
  'advocacia-previdenciario': {
    heading: 'Guia de registros', help: 'Oriente a organização de documentos e mensagens relacionados ao assunto. Não inclua dados pessoais na arte.',
    block: 'Registro', title: 'Tipo de registro', description: 'O que reunir', example: 'Ex.: Comprovantes', add: 'Adicionar registro',
  },
  'advocacia-empresarial': {
    heading: 'Contato seguro', help: 'Oriente a confirmação de pedidos de dados ou pagamentos pelos canais conhecidos do escritório.',
    block: 'Cuidado', title: 'Cuidado de segurança', description: 'Como conferir', example: 'Ex.: Confira a origem', add: 'Adicionar cuidado',
  },
  'advocacia-contratos': {
    heading: 'Pauta aberta', help: 'Convide o público a sugerir temas informativos. Peça apenas o assunto, sem detalhes de casos ou dados pessoais.',
    block: 'Convite', title: 'Orientação para participar', description: 'Como sugerir um tema', example: 'Ex.: Sugira uma pauta', add: 'Adicionar orientação de participação',
  },
  'advocacia-perfil': {
    heading: 'Perfil profissional', help: 'Apresente nome, inscrição, localidade e modalidade reais. Use uma foto fornecida pelo profissional.',
    block: 'Informação', title: 'Informação do perfil', description: 'Descrição da informação', example: 'Ex.: Atuação profissional', add: 'Adicionar informação', highlight: 'Especialidade ou destaque (opcional)',
  },
  'advocacia-comunicado': {
    heading: 'Aviso com data', help: 'Destaque a data ou o período e explique o que muda no atendimento.',
    block: 'Detalhe', title: 'Informação do aviso', description: 'Detalhe do aviso', example: 'Ex.: Horário de atendimento', add: 'Adicionar detalhe ao aviso', highlight: 'Data ou período',
  },
};

export function LegalPostFields({ templateKey, value, onChange, validationAttempt = 0 }: { templateKey: string; value: LegalPostPayload; onChange: (next: LegalPostPayload) => void; validationAttempt?: number }) {
  const labels = MODEL_FIELDS[templateKey] ?? MODEL_FIELDS['advocacia-cartao'];
  const { register, control, watch, trigger, formState: { errors } } = useForm<LegalPostPayload>({
    defaultValues: { eyebrow: '', summary: '', highlight: '', ...value, contactLayout: value.contactLayout ?? 'complete' }, resolver: zodResolver(legalPostSchemaFor(templateKey)), mode: 'onBlur',
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'areas' });
  const blocksError = errors.areas?.root?.message ?? errors.areas?.message;
  useEffect(() => {
    const subscription = watch(next => onChange(next as LegalPostPayload));
    return () => subscription.unsubscribe();
  }, [watch, onChange]);
  useEffect(() => {
    if (validationAttempt) void trigger(undefined, { shouldFocus: true });
  }, [validationAttempt, trigger]);
  const input = 'w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-base text-text-primary focus:border-accent focus:outline-none';
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface p-4" aria-label="Informações do escritório">
      <div>
        <h4 className="font-semibold text-text-primary">{labels.heading}</h4>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">{labels.help} Esses dados aparecem na arte.</p>
      </div>
      <Field label="Nome profissional ou do escritório" error={errors.professionalName?.message}>
        <input id="legal-name" maxLength={90} {...register('professionalName')} className={input} placeholder="Ex.: Bruno Azevedo Advocacia" />
      </Field>
      <Field label="Inscrição na OAB" error={errors.registration?.message}>
        <input id="legal-registration" maxLength={40} {...register('registration')} className={input} placeholder="Ex.: OAB/UF 00000" />
      </Field>
      <Field label="Seção (opcional)" hint="Uma identificação curta acima do título, como Orientação jurídica." error={errors.eyebrow?.message}>
        <input id="legal-eyebrow" maxLength={40} {...register('eyebrow')} className={input} placeholder="Ex.: Informação jurídica" />
      </Field>
      <Field label={labels.summary ?? 'Texto principal (opcional)'} hint={labels.summaryHint ?? 'Uma frase basta. Use a legenda para os detalhes.'} error={errors.summary?.message}>
        <textarea id="legal-summary" rows={3} maxLength={160} {...register('summary')} className={input} />
      </Field>
      <Field label={labels.highlight ?? 'Destaque (opcional)'} hint="Uma informação curta que merece destaque na composição." error={errors.highlight?.message}>
        <input id="legal-highlight" maxLength={60} {...register('highlight')} className={input} />
      </Field>
      <p className="text-sm leading-relaxed text-text-muted">{OPTIONAL_BLOCK_MODELS.has(templateKey) ? 'Os blocos de apoio são opcionais; remova os que não usar.' : 'Adicione de um a quatro blocos curtos.'} Revise a prévia no formato escolhido para manter a leitura confortável.</p>
      {blocksError && <p role="alert" className="text-sm text-danger">{blocksError}</p>}
      {fields.map((field, index) => (
        <fieldset key={field.id} className="space-y-3 rounded-xl border border-border p-3">
          <legend className="px-1 text-sm font-semibold text-text-secondary">{labels.block} {index + 1}</legend>
          <Field label={labels.title} error={errors.areas?.[index]?.title?.message}>
            <input id={'legal-area-' + index} maxLength={50} {...register(`areas.${index}.title`)} className={input} placeholder={labels.example} />
          </Field>
          <Field label={labels.description} error={errors.areas?.[index]?.description?.message}>
            <textarea id={'legal-description-' + index} rows={3} maxLength={140} {...register(`areas.${index}.description`)} className={input} />
          </Field>
          {(fields.length > 1 || OPTIONAL_BLOCK_MODELS.has(templateKey)) && <button type="button" onClick={() => remove(index)} className="min-h-11 text-sm font-semibold text-danger">Remover bloco {index + 1}</button>}
        </fieldset>
      ))}
      {fields.length < 4 && <button type="button" onClick={() => append({ title: '', description: '' })} className="min-h-11 rounded-xl border border-border px-3 text-sm font-semibold text-text-primary">{labels.add}</button>}
      <Field label="Dados de contato na arte" hint="Essencial mostra telefone, ou site se não houver telefone. Completo inclui todos os contatos preenchidos.">
        <select id="legal-contact-layout" {...register('contactLayout')} className={input}>
          <option value="essential">Essencial · um contato</option>
          <option value="complete">Completo · todos os dados</option>
        </select>
      </Field>
      <Field label="Contato na imagem" error={errors.contact?.message}><input id="legal-contact" maxLength={40} {...register('contact')} className={input} placeholder="Telefone ou WhatsApp profissional" /></Field>
      <Field label="Endereço (opcional)" error={errors.address?.message}><input id="legal-address" maxLength={100} {...register('address')} className={input} /></Field>
      <Field label="Site ou e-mail (opcional)" error={errors.website?.message}><input id="legal-website" maxLength={80} {...register('website')} className={input} /></Field>
    </section>
  );
}
