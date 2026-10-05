import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(root, 'tsconfig.json');
const cfg = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, root);
const program = ts.createProgram(parsed.fileNames, parsed.options);
const checker = program.getTypeChecker();

const srcRoot = path.join(root, 'src').split(path.sep).join('/');
const local = f => f.split(path.sep).join('/').startsWith(srcRoot + '/');
const isExcludedDefiner = f => /\.(test|stories)\.tsx?$/.test(f) || /\.d\.ts$/.test(f);
const resolveAlias = symbol => {
  let s = symbol;
  const seen = new Set();
  while (s && (s.flags & ts.SymbolFlags.Alias) && !seen.has(s)) { seen.add(s); s = checker.getAliasedSymbol(s); }
  return s;
};
const keyOf = symbol => {
  const s = resolveAlias(symbol);
  const decl = s?.declarations?.[0];
  if (!decl) return undefined;
  const file = ts.isSourceFile(decl) ? decl.fileName : decl.getSourceFile?.().fileName;
  return file ? `${file}|${s.name}` : undefined;
};

const consumed = new Set();
const unresolved = [];
const fileImporters = new Map();
const noteImport = target => fileImporters.set(target, (fileImporters.get(target) ?? 0) + 1);
const resolve = (spec, from) => ts.resolveModuleName(spec, from, parsed.options, ts.sys).resolvedModule?.resolvedFileName;
const moduleSymbol = file => {
  const sf = program.getSourceFile(file);
  return sf && checker.getSymbolAtLocation(sf);
};
const markAll = file => {
  const mod = moduleSymbol(file);
  if (!mod) return;
  for (const exp of checker.getExportsOfModule(mod)) { const k = keyOf(exp); if (k) consumed.add(k); }
};

for (const sf of program.getSourceFiles()) {
  if (sf.fileName.includes('node_modules')) continue;
  const visit = node => {
    if (ts.isImportDeclaration(node)) {
      const spec = node.moduleSpecifier.getText().slice(1, -1);
      const target = resolve(spec, sf.fileName);
      if (!target) unresolved.push(`${path.basename(sf.fileName)}: ${spec}`);
      else { noteImport(target); if (!node.importClause) markAll(target); else {
        const mod = moduleSymbol(target);
        if (node.importClause.name) {
          const k = keyOf(checker.getSymbolAtLocation(node.importClause.name));
          if (k) consumed.add(k); else if (mod) for (const e of checker.getExportsOfModule(mod)) { const ek = keyOf(e); if (ek) consumed.add(ek); }
        }
        const bindings = node.importClause.namedBindings;
        if (bindings && ts.isNamespaceImport(bindings)) {
          if (mod) for (const e of checker.getExportsOfModule(mod)) { const ek = keyOf(e); if (ek) consumed.add(ek); }
        } else if (bindings) {
          for (const el of bindings.elements) {
            const k = keyOf(checker.getSymbolAtLocation(el.name));
            if (k) consumed.add(k);
          }
        }
      }
      }
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const arg = node.arguments[0];
      if (arg && ts.isStringLiteralLike(arg)) {
        const target = resolve(arg.text, sf.fileName);
        if (target) { noteImport(target); markAll(target); }
      }
    } else if (ts.isCallExpression(node) && node.expression.getText() === 'require' && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) {
      const target = resolve(node.arguments[0].text, sf.fileName);
      if (target) { noteImport(target); markAll(target); }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

const orphans = new Set();
const perFile = new Map();
let examined = 0;
for (const sf of program.getSourceFiles()) {
  if (!local(sf.fileName) || sf.fileName.includes('node_modules') || isExcludedDefiner(sf.fileName)) continue;
  const mod = checker.getSymbolAtLocation(sf);
  if (!mod) continue;
  for (const exp of checker.getExportsOfModule(mod)) {
    examined++;
    const k = keyOf(exp);
    const stat = perFile.get(sf.fileName) ?? { total: 0, used: 0 };
    stat.total++;
    if (k) {
      if (consumed.has(k)) stat.used++;
      else orphans.add(`${path.relative(root, k.split('|')[0]).split(path.sep).join('/')} :: ${exp.name}`);
    }
    perFile.set(sf.fileName, stat);
  }
}
const orphanList = [...orphans].sort();
console.log(`Exports analisados: ${examined}; chaves consumidas: ${consumed.size}.`);
if (process.env.DEBUG_ORPHANS) {
  const sample = [];
  for (const sf of program.getSourceFiles()) {
    if (!local(sf.fileName) || sf.fileName.includes('node_modules') || isExcludedDefiner(sf.fileName)) continue;
    const mod = checker.getSymbolAtLocation(sf);
    if (!mod) continue;
    for (const exp of checker.getExportsOfModule(mod)) { sample.push(`${exp.name} -> ${keyOf(exp)}`); if (sample.length >= 8) break; }
    if (sample.length >= 8) break;
  }
  console.log('SAMPLE EXPORT KEYS:\n' + sample.join('\n'));
  console.log('SAMPLE CONSUMED:\n' + [...consumed].slice(0, 8).join('\n'));
}
console.log(orphanList.length ? `Possíveis exports órfãos (${orphanList.length}):\n${orphanList.join('\n')}` : 'Nenhum export órfão.');
const deadFiles = [...perFile.entries()]
  .filter(([, stat]) => stat.total > 0 && stat.used === 0)
  .filter(([file]) => !fileImporters.has(file))
  .map(([file]) => path.relative(root, file).split(path.sep).join('/'))
  .sort();
console.log(`\nArquivos src sem importador e com todos os exports órfãos (${deadFiles.length}):\n${deadFiles.join('\n') || '- nenhum'}`);
const uniqUnresolved = [...new Set(unresolved)];
if (uniqUnresolved.length) console.log(`\nImports não resolvidos (${uniqUnresolved.length}):\n${uniqUnresolved.slice(0, 20).join('\n')}`);
