import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.resolve(process.env.API_CONTRACT_BACKEND || path.join(root, '../backend'));
const backendEntry = path.join(backend, 'src/shared/infra/http/routes/api.ts');
if (!fs.existsSync(backendEntry)) {
  throw new Error(
    `Backend não encontrado em "${backend}" (esperado ${backendEntry}). ` +
      'Defina API_CONTRACT_BACKEND com o caminho da pasta do backend.',
  );
}
const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']);
const parse = file => ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
function walk(node, visit) { visit(node); ts.forEachChild(node, child => walk(child, visit)); }
const literal = node => node && ts.isStringLiteralLike(node) ? node.text : undefined;
const property = (node, name) => node && ts.isObjectLiteralExpression(node)
  ? node.properties.find(p => p.name?.getText() === name)?.initializer : undefined;
const normalize = value => value.split('?')[0].replace(/:[^/]+/g, '{}');
const returnExpression = body => {
  let found;
  walk(body, node => { if (!found && ts.isReturnStatement(node) && node.expression) found = node.expression; });
  return found;
};
// Helpers locais de URL (const f = (…) => `…` / function f(…) { return `…` }) — resolvíveis
// como caminhos; qualquer outro nó continua falhando fechado em requestPath.
function helperMap(ast) {
  const map = new Map();
  walk(ast, node => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer &&
        (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) {
      const body = node.initializer.body;
      const expr = ts.isBlock(body) ? returnExpression(body) : body;
      if (expr) map.set(node.name.text, expr);
    } else if (ts.isFunctionDeclaration(node) && node.name && node.body) {
      const expr = returnExpression(node.body);
      if (expr) map.set(node.name.text, expr);
    }
  });
  return map;
}
const helperTarget = (node, helpers, seen) => {
  if (node && ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
      helpers.has(node.expression.text) && !seen.has(node.expression.text)) {
    return { name: node.expression.text, expr: helpers.get(node.expression.text) };
  }
  return undefined;
};

// A deliberately narrow parser: unsupported route registration must fail, never disappear silently.
export function backendRoutes(base) {
  const entry = parse(path.join(base, 'src/shared/infra/http/routes/api.ts'));
  const entryFile = path.join(base, 'src/shared/infra/http/routes/api.ts');
  const app = parse(path.join(base, 'src/shared/infra/http/app.ts'));
  let prefix;
  walk(app, node => {
    if (ts.isCallExpression(node) && node.expression.getText() === 'app.register' && node.arguments[0]?.getText() === 'apiRoutes') {
      prefix = literal(property(node.arguments[1], 'prefix'));
    }
  });
  if (!prefix) throw new Error('Não foi possível resolver o prefixo de apiRoutes em app.ts');
  const routes = new Set();
  const visited = new Set();
  const parseFile = new Map([[entryFile, entry]]);

  const importsOf = ast => {
    const imports = new Map();
    for (const node of ast.statements) {
      if (!ts.isImportDeclaration(node)) continue;
      const source = literal(node.moduleSpecifier);
      for (const binding of node.importClause?.namedBindings?.elements || []) {
        imports.set(binding.name.text, source);
      }
    }
    return imports;
  };
  const stringConstsOf = ast => {
    const consts = new Map();
    walk(ast, node => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && literal(node.initializer) !== undefined) {
        consts.set(node.name.text, literal(node.initializer));
      }
    });
    return consts;
  };
  const resolveUrl = (node, file, consts) => {
    if (literal(node) !== undefined) return literal(node);
    if (ts.isTemplateExpression(node)) {
      let url = node.head.text;
      for (const span of node.templateSpans) {
        const value = literal(span.expression) ??
          (ts.isIdentifier(span.expression) ? consts.get(span.expression.text) : undefined);
        if (value === undefined) throw new Error(`Rota dinâmica não suportada em ${file}`);
        url += value + span.literal.text;
      }
      return url;
    }
    throw new Error(`Rota dinâmica não suportada em ${file}`);
  };
  const resolveImport = (source, fromFile) => path.resolve(
    source.startsWith('@/') ? path.join(base, 'src') : path.dirname(fromFile),
    source.replace(/^\@\//, ''),
  ) + '.ts';

  const visit = (file, strict) => {
    if (visited.has(file)) return 0;
    visited.add(file);
    const ast = parseFile.get(file) ?? parse(file);
    const imports = importsOf(ast);
    const consts = stringConstsOf(ast);
    let count = 0;
    let delegated = 0;
    walk(ast, node => {
      if (!ts.isCallExpression(node)) return;
      const target = node.expression.getText();
      if (ts.isIdentifier(node.expression) && node.arguments[0]?.getText() === 'app') {
        const source = imports.get(target);
        if (source) { delegated += visit(resolveImport(source, file), false); return; }
        if (strict) throw new Error(`Registro desconhecido: ${node.getText()}`);
        return;
      }
      if (!ts.isPropertyAccessExpression(node.expression) || node.expression.expression.getText() !== 'app') return;
      const method = node.expression.name.text;
      if (method === 'register' || method === 'route') throw new Error(`Registro não suportado em ${file}: ${node.getText()}`);
      if (!methods.has(method)) return;
      const url = resolveUrl(node.arguments[0], file, consts);
      routes.add(`${method.toUpperCase()} ${normalize(prefix + url)}`);
      count++;
    });
    if (!count && !delegated) throw new Error(`Nenhuma rota extraída de ${file}`);
    return count + delegated;
  };

  visit(entryFile, true);
  if (!routes.size) throw new Error('Inventário backend vazio');
  return routes;
}

export function requestPath(node, bindings = {}, helpers = new Map(), seen = new Set()) {
  if (node && ts.isIdentifier(node) && bindings[node.text]) return normalize(bindings[node.text]);
  if (literal(node) !== undefined) return normalize(literal(node));
  const target = helperTarget(node, helpers, seen);
  if (target) return requestPath(target.expr, bindings, helpers, new Set([...seen, target.name]));
  if (!node || !ts.isTemplateExpression(node)) throw new Error(`URL não suportada: ${node?.getText()}`);
  let url = node.head.text;
  for (const span of node.templateSpans) {
    if (url.includes('?')) break;
    const spanTarget = helperTarget(span.expression, helpers, seen);
    if (spanTarget && (!url || url.endsWith('/'))) {
      url += requestPath(spanTarget.expr, bindings, helpers, new Set([...seen, spanTarget.name])) + span.literal.text;
      continue;
    }
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

/**
 * Segmento final dinâmico com tipo union declarado no próprio arquivo
 * (ex.: ações de conta `suspend | approve | …`). Emite uma chamada por literal
 * para que TODAS casem com rotas registradas — nada é aceito por prefixo.
 * Retorna [] quando o padrão não se aplica (comportamento anterior preservado).
 */
function dynamicSegmentVariants(node, ast, url) {
  if (!url.endsWith('{}')) return [];
  const arg = node.arguments[0];
  if (!arg || !ts.isTemplateExpression(arg) || !arg.templateSpans.length) return [];
  const last = arg.templateSpans[arg.templateSpans.length - 1];
  if (!ts.isIdentifier(last.expression)) return [];

  let owner = node.parent;
  while (owner && !ts.isFunctionDeclaration(owner) && !ts.isFunctionExpression(owner) &&
         !ts.isArrowFunction(owner) && !ts.isMethodDeclaration(owner)) {
    owner = owner.parent;
  }
  const param = owner?.parameters?.find(p => p.name.getText() === last.expression.text);
  const annotation = param?.type;
  if (!annotation || !ts.isTypeReferenceNode(annotation) || !ts.isIdentifier(annotation.typeName)) return [];

  let literals;
  walk(ast, candidate => {
    if (literals) return;
    if (ts.isTypeAliasDeclaration(candidate) && candidate.name.text === annotation.typeName.text &&
        ts.isUnionTypeNode(candidate.type)) {
      const values = candidate.type.types.map(member =>
        literal(ts.isLiteralTypeNode(member) ? member.literal : member),
      );
      if (values.length && values.every(Boolean)) literals = values;
    }
  });
  if (!literals) return [];

  const prefix = url.slice(0, url.lastIndexOf('{}'));
  return literals.map(value => `${prefix}${value}`);
}

export function frontendRequests(file) {
  const ast = parse(file);
  const helpers = helperMap(ast);
  const requests = [];
  walk(ast, node => {
    if (!ts.isCallExpression(node)) return;
    const name = node.expression.getText();
    if (!['apiClient', 'apiFetch', 'fetch', 'clientFetch'].includes(name)) return;
    // Transport implementation and signed storage PUT are not API wrappers.
    if (name === 'fetch' && node.arguments[0]?.getText() === 'uploadUrl') return;
    if ((name === 'fetch' || name === 'clientFetch') && node.arguments[0] && ts.isIdentifier(node.arguments[0])) {
      const argName = node.arguments[0].text;
      let owner = node.parent;
      while (owner && !ts.isFunctionDeclaration(owner) && !ts.isFunctionExpression(owner) && !ts.isArrowFunction(owner)) {
        owner = owner.parent;
      }
      const paramNames = owner?.parameters?.map(p => p.name.getText()) ?? [];
      if (paramNames.includes(argName)) return;
    }
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
    const url = requestPath(node.arguments[0], bindings, helpers);
    if (!url.startsWith('/api/')) throw new Error(`URL fora de /api em ${file}: ${url}`);
    const methodNode = name === 'apiClient' ? node.arguments[1] : property(node.arguments[1], 'method');
    const method = methodNode ? literal(methodNode) : 'GET';
    if (!method || !methods.has(method.toLowerCase())) throw new Error(`Método não suportado em ${file}`);
    const line = ast.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    const keys = dynamicSegmentVariants(node, ast, url).map(variant => `${method.toUpperCase()} ${variant}`);
    if (!keys.length) keys.push(`${method.toUpperCase()} ${url}`);
    for (const key of keys) requests.push({ key, line });
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
