import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.resolve(process.env.API_CONTRACT_BACKEND || path.join(root, '../agendai-back-end'));
const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']);
const parse = file => ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
function walk(node, visit) { visit(node); ts.forEachChild(node, child => walk(child, visit)); }
const literal = node => node && ts.isStringLiteralLike(node) ? node.text : undefined;
const property = (node, name) => node && ts.isObjectLiteralExpression(node)
  ? node.properties.find(p => p.name?.getText() === name)?.initializer : undefined;
const normalize = value => value.split('?')[0].replace(/:[^/]+/g, '{}');

// A deliberately narrow parser: unsupported route registration must fail, never disappear silently.
export function backendRoutes(base) {
  const entry = parse(path.join(base, 'src/shared/infra/http/routes/api.ts'));
  const app = parse(path.join(base, 'src/shared/infra/http/app.ts'));
  let prefix;
  walk(app, node => {
    if (ts.isCallExpression(node) && node.expression.getText() === 'app.register' && node.arguments[0]?.getText() === 'apiRoutes') {
      prefix = literal(property(node.arguments[1], 'prefix'));
    }
  });
  if (!prefix) throw new Error('Não foi possível resolver o prefixo de apiRoutes em app.ts');
  const imports = new Map();
  for (const node of entry.statements) {
    if (!ts.isImportDeclaration(node)) continue;
    const source = literal(node.moduleSpecifier);
    for (const binding of node.importClause?.namedBindings?.elements || []) {
      imports.set(binding.name.text, source);
    }
  }
  const routes = new Set();
  walk(entry, node => {
    if (!ts.isCallExpression(node) || node.arguments[0]?.getText() !== 'app') return;
    const source = imports.get(node.expression.getText());
    if (!source) throw new Error(`Registro desconhecido: ${node.getText()}`);
    const file = path.resolve(source.startsWith('@/') ? path.join(base, 'src') : path.dirname(entry.fileName), source.replace(/^@\//, '')) + '.ts';
    const ast = parse(file);
    let count = 0;
    walk(ast, call => {
      if (!ts.isCallExpression(call) || !ts.isPropertyAccessExpression(call.expression) || call.expression.expression.getText() !== 'app') return;
      const method = call.expression.name.text;
      if (method === 'register' || method === 'route') throw new Error(`Registro não suportado em ${file}: ${call.getText()}`);
      if (!methods.has(method)) return;
      const url = literal(call.arguments[0]);
      if (!url) throw new Error(`Rota dinâmica não suportada em ${file}`);
      routes.add(`${method.toUpperCase()} ${normalize(prefix + url)}`);
      count++;
    });
    if (!count) throw new Error(`Nenhuma rota extraída de ${file}`);
  });
  if (!routes.size) throw new Error('Inventário backend vazio');
  return routes;
}

export function requestPath(node, bindings = {}) {
  if (node && ts.isIdentifier(node) && bindings[node.text]) return normalize(bindings[node.text]);
  if (literal(node) !== undefined) return normalize(literal(node));
  if (!node || !ts.isTemplateExpression(node)) throw new Error(`URL não suportada: ${node?.getText()}`);
  let url = node.head.text;
  for (const span of node.templateSpans) {
    if (url.includes('?')) break;
    const expr = span.expression.getText();
    if (!url && bindings[expr]) { url += bindings[expr] + span.literal.text; continue; }
    if (expr === 'API_BASE' && !url) { url += span.literal.text; continue; }
    // Query helpers are suffixes; a path parameter must occupy an entire segment.
    if (!url.endsWith('/')) {
      if (ts.isConditionalExpression(span.expression) &&
          [span.expression.whenTrue, span.expression.whenFalse].every(value => literal(value) === '' || literal(value)?.startsWith('?')) && !span.literal.text) break;
      if (/^(qs|query|queryString|search|buildQuery)(\b|\()/.test(expr) && !span.literal.text) break;
      throw new Error(`Interpolação ambígua: ${node.getText()}`);
    }
    url += '{}' + span.literal.text;
  }
  return normalize(url);
}

export function frontendRequests(file) {
  const ast = parse(file);
  const requests = [];
  walk(ast, node => {
    if (!ts.isCallExpression(node)) return;
    const name = node.expression.getText();
    if (!['apiClient', 'apiFetch', 'fetch'].includes(name)) return;
    // Transport implementation and signed storage PUT are not API wrappers.
    if (name === 'fetch' && node.arguments[0]?.getText() === 'uploadUrl') return;
    let owner = node.parent;
    while (owner && !ts.isFunctionDeclaration(owner)) owner = owner.parent;
    const variants = [];
    if (owner?.parameters.some(p => p.name.getText() === 'path')) {
      walk(ast, call => {
        if (ts.isCallExpression(call) && call.expression.getText() === owner.name.text) {
          const value = literal(call.arguments[0]);
          if (!value) throw new Error(`Factory dinâmica em ${file}`);
          variants.push({ path: value });
        }
      });
      if (!variants.length) throw new Error(`Factory sem consumidores em ${file}`);
    } else variants.push({});
    for (const bindings of variants) {
    const url = requestPath(node.arguments[0], bindings);
    if (!url.startsWith('/api/')) throw new Error(`URL fora de /api em ${file}: ${url}`);
    const methodNode = name === 'apiClient' ? node.arguments[1] : property(node.arguments[1], 'method');
    const method = methodNode ? literal(methodNode) : 'GET';
    if (!method || !methods.has(method.toLowerCase())) throw new Error(`Método não suportado em ${file}`);
    requests.push({ key: `${method.toUpperCase()} ${url}`, line: ast.getLineAndCharacterOfPosition(node.getStart()).line + 1 });
    }
  });
  return requests;
}

export function checkContract() {
  const routes = backendRoutes(backend);
  const infra = path.join(root, 'src/infra');
  const errors = [];
  const debt = new Set(JSON.parse(fs.readFileSync(path.join(root, 'scripts/api-contract-debt.json'), 'utf8')).entries);
  const pending = new Set();
  let count = 0;
  for (const file of fs.readdirSync(infra).filter(file => file.endsWith('Api.ts'))) {
    for (const request of frontendRequests(path.join(infra, file))) {
      count++;
      if (!routes.has(request.key)) {
        const key = `${file}: ${request.key}`;
        if (debt.has(key)) pending.add(key);
        if (!debt.has(key) || process.argv.includes('--strict')) errors.push(`${file}:${request.line}: ${request.key}`);
      }
    }
  }
  if (!count) throw new Error('Nenhuma chamada frontend encontrada');
  for (const key of debt) if (!pending.has(key)) errors.push(`Remova pendência resolvida/obsoleta do inventário: ${key}`);
  if (errors.length) throw new Error(`Chamadas sem rota backend:\n${errors.join('\n')}`);
  console.log(`contract:check OK: ${count} chamadas em wrappers; ${routes.size} rotas backend (método/caminho).`);
  if (pending.size) console.warn(`${pending.size} divergências preexistentes em scripts/api-contract-debt.json; use --strict para reprovar também essas pendências.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { checkContract(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
