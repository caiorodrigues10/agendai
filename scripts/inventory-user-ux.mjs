import ts from 'typescript';
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const publicPages = new Set([
  'PublicHome',
  'PublicProductPage',
  'PublicAppointmentManagePage',
  'PublicReviewPage',
  'PublicNpsPage',
  'PublicPostPage',
  'ShowcasePage',
  'ClientPortalPage',
  'LoginPage',
  'ForgotPasswordPage',
  'ResetPasswordPage',
  'PublicOwnerInvitePage',
  'EmailVerifiedPage',
  'AccessBlockedPage',
  'PlansPage',
  'CheckoutPage',
  'StaffDashboard',
]);
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const sources = walk('src')
  .filter(file => file.endsWith('.tsx') && !/\.(test|stories)\.tsx$/.test(file))
  .filter(file => {
    const name = file.replaceAll('\\', '/');
    return (
      (name.startsWith('src/features/') && !name.startsWith('src/features/billing/')) ||
      name.startsWith('src/layouts/app/') ||
      name.startsWith('src/components/ui/') ||
      name.startsWith('src/components/patterns/') ||
      (name.startsWith('src/pages/') && publicPages.has(path.basename(file, '.tsx')))
    );
  });
const controls = new Set([
  'button',
  'a',
  'input',
  'select',
  'textarea',
  'summary',
  'Button',
  'SmartSelect',
  'Tabs',
  'ModalShell',
  'ConfirmDialog',
]);
const rows = [];
for (const file of sources) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  function visit(node) {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      const tag = opening.tagName.getText(source);
      if (controls.has(tag)) {
        const props = Object.fromEntries(
          opening.attributes.properties
            .filter(ts.isJsxAttribute)
            .map(attribute => [
              attribute.name.getText(source),
              attribute.initializer?.getText(source) ?? 'true',
            ])
        );
        const text = ts.isJsxElement(node)
          ? node.children
              .filter(ts.isJsxText)
              .map(child => child.text.trim())
              .filter(Boolean)
              .join(' ')
          : '';
        rows.push({
          file: file.replaceAll('\\', '/'),
          line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
          control: tag,
          label: props['aria-label'] ?? props.label ?? props.title ?? text ?? '',
          action:
            props.onClick ??
            props.onChange ??
            props.onSubmit ??
            props.onConfirm ??
            props.href ??
            '',
          disabled: props.disabled ?? props.loading ?? '',
          status: 'inventariado-no-codigo',
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
mkdirSync('docs/ux', { recursive: true });
writeFileSync(
  'docs/ux/interaction-inventory.json',
  JSON.stringify(
    {
      note: 'Inventário estático, não equivale à cobertura de cliques no navegador. Condicionais e componentes customizados exigem os cenários descritos em USER_EXPERIENCE_AUDIT.md.',
      files: sources.length,
      controls: rows.length,
      entries: rows,
    },
    null,
    2
  ) + '\n'
);
console.log(`${sources.length} sources; ${rows.length} native/shared controls inventoried.`);
