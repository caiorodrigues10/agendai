#!/usr/bin/env node
/**
 * Espelha catálogo, preset de horário e modo sugerido do backend no frontend.
 *
 * Lê `segmentParity.json` (gerado por `npm run segments:parity` no backend)
 * e escreve `src/shared/segments/segmentCatalogs.ts`. Não editar o arquivo
 * gerado à mão — rode `npm run segments:mirror`.
 *
 * Uso: npm run segments:mirror
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.resolve(
  process.env.API_CONTRACT_BACKEND || path.join(root, '../backend'),
);
const parityPath = path.join(backend, 'src/shared/segments/segmentParity.json');
if (!fs.existsSync(parityPath)) {
  console.error(`segmentParity.json não encontrado em ${parityPath}`);
  process.exit(1);
}
const parity = JSON.parse(fs.readFileSync(parityPath, 'utf8'));

const quote = (value) => `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const DAY_NAMES = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

/** Nome de const a partir do conteúdo ("Seg-Sáb 09:00–19:00" → PRESET_SEG_SAB_0900_1900). */
function presetName(schedule, index) {
  const open = schedule.filter((d) => d.isOpen).sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  if (open.length === 0) return `PRESET_TODAS_FECHADAS_${index}`;
  // Agrupa dias consecutivos: SEG,TER,QUA,QUI,SEX,SAB → SEG_SAB.
  const groups = [];
  for (const day of open) {
    const last = groups[groups.length - 1];
    if (last && day.dayOfWeek === last.end + 1) last.end = day.dayOfWeek;
    else groups.push({ start: day.dayOfWeek, end: day.dayOfWeek });
  }
  const days = groups
    .map((g) => (g.start === g.end ? DAY_NAMES[g.start] : `${DAY_NAMES[g.start]}_${DAY_NAMES[g.end]}`))
    .join('_');
  const hours = `${open[0].openTime.replace(':', '')}_${open[0].closeTime.replace(':', '')}`;
  return `PRESET_${days}_${hours}`;
}

const presets = new Map();
for (const segment of parity.allSegments) {
  const key = JSON.stringify(parity.segments[segment].schedulePreset);
  if (!presets.has(key)) presets.set(key, { name: presetName(parity.segments[segment].schedulePreset, presets.size), schedule: parity.segments[segment].schedulePreset });
}

const lines = [];
lines.push('/* eslint-disable max-lines -- arquivo gerado; rode `npm run segments:mirror` */');
lines.push('/**');
lines.push(' * Catálogo inicial, preset de horário e modo sugerido de cada segmento.');
lines.push(' *');
lines.push(' * GERADO a partir do `segmentParity.json` do backend (fonte única).');
lines.push(' * Depois de mexer em `backend/src/shared/segments`, rode:');
lines.push(' *   npm run segments:parity   (backend)');
lines.push(' *   npm run segments:mirror   (frontend)');
lines.push(' * O teste de paridade compara este arquivo com o JSON, então dados');
lines.push(' * desatualizados falham no teste, não em produção.');
lines.push(' */');
lines.push(`import type { BusinessSegment, SegmentCatalog, SegmentOperationMode, SegmentScheduleDay } from './types';`);
lines.push('');
for (const { name, schedule } of presets.values()) {
  const body = schedule
    .map(
      (d) =>
        `{ dayOfWeek: ${d.dayOfWeek}, isOpen: ${d.isOpen}, openTime: ${quote(d.openTime)}, closeTime: ${quote(d.closeTime)} }`,
    )
    .join(', ');
  lines.push(`const ${name}: SegmentScheduleDay[] = [${body}];`);
}
lines.push('');
lines.push('export const SEGMENT_SCHEDULE_PRESETS: Record<BusinessSegment, SegmentScheduleDay[]> = {');
for (const segment of parity.allSegments) {
  const key = JSON.stringify(parity.segments[segment].schedulePreset);
  lines.push(`  ${segment}: ${presets.get(key).name},`);
}
lines.push('};');
lines.push('');
lines.push('export const SEGMENT_OPERATION_MODES: Record<BusinessSegment, SegmentOperationMode> = {');
for (const segment of parity.allSegments) {
  lines.push(`  ${segment}: ${quote(parity.segments[segment].suggestedOperationMode)},`);
}
lines.push('};');
lines.push('');
lines.push('export const SEGMENT_CATALOGS: Record<BusinessSegment, SegmentCatalog> = {');
for (const segment of parity.allSegments) {
  const { serviceCategories, services } = parity.segments[segment].catalog;
  lines.push(`  ${segment}: {`);
  lines.push('    serviceCategories: [');
  for (const category of serviceCategories) {
    lines.push(`      { name: ${quote(category.name)}, icon: ${quote(category.icon)} },`);
  }
  lines.push('    ],');
  lines.push('    services: [');
  for (const service of services) {
    lines.push(
      `      { name: ${quote(service.name)}, price: ${service.price}, avgTimeMinutes: ${service.avgTimeMinutes}, icon: ${quote(service.icon)}, categoryName: ${quote(service.categoryName)} },`,
    );
  }
  lines.push('    ],');
  lines.push('  },');
}
lines.push('};');

const target = path.join(root, 'src/shared/segments/segmentCatalogs.ts');
fs.writeFileSync(target, `${lines.join('\n')}\n`, 'utf8');
console.log(
  `segmentCatalogs.ts atualizado (${parity.allSegments.length} segmentos, ${presets.size} presets de horário).`,
);
