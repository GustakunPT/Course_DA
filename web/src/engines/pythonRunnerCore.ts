import type { PyodideInterface } from 'pyodide';

export interface PythonAssertionCheck {
  label: string;
  passed: boolean;
  actual: string;
  hint: string;
}

export interface PythonExecutionResult {
  stdout: string;
  table?: { columns: string[]; rows: string[][] };
  checks?: PythonAssertionCheck[];
  /** Gráficos matplotlib desenhados pelo código, em PNG (base64). */
  images?: string[];
  elapsedMs: number;
  error?: string;
}

export interface PythonCheckSpec {
  label: string;
  expr: string;
  actualExpr: string;
  hint: string;
}

/**
 * Versão do Pyodide (Python 3.14). Tem de ser igual à do pacote npm "pyodide" (os testes verificam);
 * ao mudar de versão, atualizar também os hashes SRI abaixo, que os testes recalculam.
 */
export const PYODIDE_VERSION = '314.0.8';
/** Versão do Python que o Pyodide traz, para mostrar ao aluno. */
export const PYTHON_VERSION_LABEL = 'Python 3.14';
export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
export const PYODIDE_SCRIPT_URL = `${PYODIDE_INDEX_URL}pyodide.js`;
export const PYODIDE_MJS_URL = `${PYODIDE_INDEX_URL}pyodide.mjs`;
export const PYODIDE_SCRIPT_SRI = 'sha384-0Tw0jFeRF+UzB1HbzjzDi5ZNMyMclQPHmYkEquv9V+lAj/rZBHxu1c35Uq28kDPo';
/** Hashes SHA-384 oficiais dos artefactos do Pyodide (verificados nos testes contra node_modules/pyodide). */
export const PYODIDE_CORE_SRI: Record<string, string> = {
  'pyodide.mjs': 'sha384-VR+eYp8LZKGhhQ7Nql3TONJIMizM0VRxz87k6V7IyuQHElicjy7ULmkOuB2LFR3b',
  'pyodide.asm.mjs': 'sha384-zZV4ZBUhsbFzcmaHqwfipWI/BS8YH7Duesu1Rrtyx1HRqFAyz+Mt/HRiMtNyWdwU',
  'pyodide.asm.wasm': 'sha384-L3e25SSwmf8Q0I8qcgGD/PNkK1wyivO8lWFSko3xXQZ8uLNcYkZXJlX8LU3oVH/o',
  'python_stdlib.zip': 'sha384-ShW1Tjb4ytDLumQGuwRa/PTLxHcN6agBzp2wIRZSJNK8tEt2QMRDnG69N58KhHqM',
  'pyodide-lock.json': 'sha384-o8SQQvpVlZnOl04+3dFTJipKxul9GbViVusA379wlOrfHSgxbzt0yPiqCTxOiYES',
};

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1).replace('.', ',');
}

/**
 * Texto do progresso de uma transferência. O Content-Length é o tamanho comprimido (br/gzip) e a
 * contagem é feita depois de descomprimir: quando passa o total, mostra-se só o que já chegou,
 * em vez de "9,2 / 3,3 MB".
 */
export function mensagemDeTransferencia(label: string, carregado: number, total: number): string {
  return total > 0 && carregado <= total
    ? `A transferir ${label} (${formatMb(carregado)} / ${formatMb(total)} MB)…`
    : `A transferir ${label} (${formatMb(carregado)} MB)…`;
}

export const MAX_PYTHON_CODE_CHARS = 30_000;
export const PYTHON_EXECUTION_TIMEOUT_MS = 18_000;
// Pacotes que se descarregam à parte. O sqlite3 já vem no Python do Pyodide (desde a 0.28), não se pede.
export const ALLOWED_PYODIDE_PACKAGES = ['pandas', 'numpy', 'matplotlib'] as const;
export const BASE_CSV_FILES = [
  'produtos.csv',
  'clientes.csv',
  'vendas.csv',
  'vendas_sazonais.csv',
  'vendas_sujas.csv',
] as const;

export const ALLOWED_PYTHON_MODULES = new Set([
  'csv',
  'collections',
  'datetime',
  'decimal',
  'functools',
  'hashlib',
  'itertools',
  'json',
  'math',
  'matplotlib',
  'numpy',
  'pandas',
  'pathlib',
  'random',
  're',
  'sqlite3',
  'statistics',
  'string',
  'typing',
  'unicodedata',
]);

/** Validação rápida no lado JS antes de entrar no Pyodide (complementada pela verificação AST em Python). */
export function validatePythonCodeScope(code: string): string | null {
  if (code.length > MAX_PYTHON_CODE_CHARS) {
    return `O código excede o limite de ${MAX_PYTHON_CODE_CHARS} caracteres permitido na bancada.`;
  }
  return null;
}

export const SANDBOX_RUNNER_PYTHON = `
def _executar_na_bancada(_codigo_fonte, _checks_str):
    import ast, builtins, io, json, math, os, pathlib, sys, traceback, warnings
    os.environ["MPLBACKEND"] = "AGG"
    warnings.filterwarnings("ignore", message=r"(?s).*Pyarrow will become a required dependency")

    _MODULOS_PERMITIDOS = {
        "csv", "collections", "datetime", "decimal", "functools", "hashlib",
        "itertools", "json", "math", "matplotlib", "numpy", "pandas", "pathlib",
        "random", "re", "sqlite3", "statistics", "string", "typing", "unicodedata",
    }
    _CHAMADAS_BLOQUEADAS = {
        "__import__", "eval", "exec", "compile", "breakpoint", "input",
        "globals", "locals", "vars", "getattr", "setattr", "delattr",
    }
    _ATRIBUTOS_BLOQUEADOS = {
        "__subclasses__", "__globals__", "__builtins__", "__code__", "__closure__",
        "__mro__", "__bases__", "__dict__", "__import__", "__loader__", "__spec__",
    }
    _MAX_STDOUT = 50000

    def _validar_ast(arvore):
        for no in ast.walk(arvore):
            if isinstance(no, ast.Import):
                for alias in no.names:
                    topo = alias.name.split(".")[0]
                    if topo not in _MODULOS_PERMITIDOS:
                        raise PermissionError(
                            f"Módulo não permitido na bancada da academia: '{topo}'. "
                            "Esta bancada executa apenas bibliotecas de análise de dados."
                        )
            elif isinstance(no, ast.ImportFrom):
                if no.level and no.level > 0:
                    raise PermissionError("Imports relativos não são permitidos na bancada.")
                topo = (no.module or "").split(".")[0]
                if topo not in _MODULOS_PERMITIDOS:
                    raise PermissionError(
                        f"Módulo não permitido na bancada da academia: '{topo}'. "
                        "Esta bancada executa apenas bibliotecas de análise de dados."
                    )
            elif isinstance(no, ast.Call) and isinstance(no.func, ast.Name):
                if no.func.id in _CHAMADAS_BLOQUEADAS:
                    raise PermissionError(
                        f"Função '{no.func.id}()' bloqueada na bancada educativa."
                    )
            elif isinstance(no, ast.Attribute) and no.attr in _ATRIBUTOS_BLOQUEADOS:
                raise PermissionError(
                    f"Acesso ao atributo '{no.attr}' bloqueado na bancada educativa."
                )

    _real_open = builtins.open
    _real_import = builtins.__import__

    def _safe_import(name, globals=None, locals=None, fromlist=(), level=0):
        topo = name.split(".")[0]
        if level != 0 or topo not in _MODULOS_PERMITIDOS:
            raise PermissionError(f"Módulo não permitido na bancada da academia: '{topo}'.")
        return _real_import(name, globals, locals, fromlist, level)

    def _safe_open(file, mode="r", *args, **kwargs):
        if any(flag in mode for flag in ("w", "a", "x", "+")):
            raise PermissionError("Escrita de ficheiros bloqueada: a bancada permite apenas leitura em dados/.")
        p = pathlib.Path(os.fspath(file)).resolve()
        permitidos = (
            pathlib.Path("/home/pyodide/dados").resolve(),
            pathlib.Path("/home/dados").resolve(),
        )
        if not any(p == base or base in p.parents for base in permitidos):
            raise PermissionError("A leitura de ficheiros na bancada está limitada à pasta dados/.")
        return _real_open(p, mode, *args, **kwargs)

    _safe_builtins = {
        k: v for k, v in vars(builtins).items() if k not in _CHAMADAS_BLOQUEADAS
    }
    _safe_builtins["__import__"] = _safe_import
    _safe_builtins["open"] = _safe_open

    _buf = io.StringIO()
    _old_out, _old_err = sys.stdout, sys.stderr
    sys.stdout = _buf
    sys.stderr = _buf

    _ns = {"__name__": "__main__", "__builtins__": _safe_builtins}
    _err = None
    _table = None
    _check_results = []

    try:
        _tree = ast.parse(_codigo_fonte, mode="exec")
        _validar_ast(_tree)
        _last_val = None
        if _tree.body and isinstance(_tree.body[-1], ast.Expr):
            _last_expr = ast.Expression(_tree.body.pop().value)
            exec(compile(_tree, "<bancada>", "exec"), _ns)
            _last_val = eval(compile(_last_expr, "<bancada>", "eval"), _ns)
        else:
            exec(compile(_tree, "<bancada>", "exec"), _ns)

        if _last_val is not None:
            if hasattr(_last_val, "to_dict") and hasattr(_last_val, "columns"):
                _sub = _last_val.head(15)
                _cols = [str(c) for c in _sub.columns]
                _rows = [[str(x) for x in row] for row in _sub.itertuples(index=False, name=None)]
                _table = {"columns": _cols, "rows": _rows}
            elif hasattr(_last_val, "to_frame") and hasattr(_last_val, "index"):
                _df_s = _last_val.head(15).reset_index()
                _cols = [str(c) for c in _df_s.columns]
                _rows = [[str(x) for x in row] for row in _df_s.itertuples(index=False, name=None)]
                _table = {"columns": _cols, "rows": _rows}
            else:
                print(repr(_last_val))

        _specs = json.loads(_checks_str)

        def correr_com(**novos):
            _arvore = ast.parse(_codigo_fonte, mode="exec")
            _validar_ast(_arvore)
            for _no in _arvore.body:
                if isinstance(_no, ast.Assign) and any(isinstance(_t, ast.Name) and _t.id in novos for _t in _no.targets):
                    _nome = next(_t.id for _t in _no.targets if isinstance(_t, ast.Name) and _t.id in novos)
                    _no.value = ast.Name(id="__novo_" + _nome, ctx=ast.Load())
            ast.fix_missing_locations(_arvore)
            _ns2 = {"__name__": "__main__", "__builtins__": _safe_builtins}
            _ns2.update({"__novo_" + _k: _v for _k, _v in novos.items()})
            _antes = sys.stdout
            sys.stdout = io.StringIO()
            try:
                exec(compile(_arvore, "<bancada>", "exec"), _ns2)
            finally:
                sys.stdout = _antes
            return _ns2

        _eval_ns = dict(_ns)
        _eval_ns["__builtins__"] = builtins
        _eval_ns["math"] = math
        _eval_ns["correr_com"] = correr_com
        for _sp in _specs:
            try:
                _actual = eval(_sp["actualExpr"], _eval_ns)
            except Exception:
                _actual = "não definido"
            try:
                _ok = bool(eval(_sp["expr"], _eval_ns))
            except Exception:
                _ok = False
            _check_results.append({
                "label": _sp["label"],
                "passed": _ok,
                "actual": repr(_actual),
                "hint": _sp["hint"]
            })
    except Exception:
        _err = traceback.format_exc().strip().splitlines()[-1]
    finally:
        sys.stdout = _old_out
        sys.stderr = _old_err

    _images = []
    if "matplotlib.pyplot" in sys.modules:
        import base64
        _plt = sys.modules["matplotlib.pyplot"]
        for _num in _plt.get_fignums()[:4]:
            _png = io.BytesIO()
            _plt.figure(_num).savefig(_png, format="png", dpi=80, bbox_inches="tight")
            _images.append(base64.b64encode(_png.getvalue()).decode("ascii"))
        _plt.close("all")

    _stdout_val = _buf.getvalue()
    if len(_stdout_val) > _MAX_STDOUT:
        _stdout_val = _stdout_val[:_MAX_STDOUT] + "\\n… (saída truncada a 50 000 caracteres)"

    return json.dumps({
        "stdout": _stdout_val,
        "error": _err,
        "table": _table,
        "checks": _check_results,
        "images": _images
    })

_res_bancada = _executar_na_bancada(__user_code__, __checks_json__)
del __user_code__, __checks_json__, _executar_na_bancada
_res_bancada
`;

export function writeCsvPairToPyodide(pyodide: PyodideInterface, name: string, content: string): void {
  pyodide.FS.writeFile(`/home/pyodide/dados/${name}`, content); // texto: grava em UTF-8
  // Se /home/dados for um atalho para /home/pyodide/dados, o ficheiro já lá está.
  let isSymlink: boolean;
  try {
    const stat = pyodide.FS.lstat('/home/dados');
    isSymlink = pyodide.FS.isLink(stat.mode);
  } catch {
    isSymlink = false;
  }
  if (!isSymlink) {
    pyodide.FS.writeFile(`/home/dados/${name}`, content);
  }
}

function stripPythonCommentsAndStrings(code: string): string {
  return code
    .replace(/'''[\s\S]*?'''|"""[\s\S]*?"""/g, ' ')
    .replace(/'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/g, ' ')
    .replace(/#[^\n]*/g, ' ');
}

export async function executeInPyodideInstance(opts: {
  pyodide: PyodideInterface;
  code: string;
  checks?: PythonCheckSpec[];
  ficheirosExtra?: string[];
  loadedPackages: Set<string>;
  loadedFiles: Set<string>;
  startTime: number;
  onStatus?: (msg: string) => void;
  onExecuting?: () => void;
}): Promise<PythonExecutionResult> {
  const {
    pyodide,
    code,
    checks,
    ficheirosExtra = [],
    loadedPackages,
    loadedFiles,
    startTime,
    onStatus,
    onExecuting,
  } = opts;

  for (const nome of ficheirosExtra) {
    if (loadedFiles.has(nome)) continue;
    onStatus?.(`A carregar ${nome}…`);
    const resposta = await fetch(`/dados/${nome}`);
    if (!resposta.ok) {
      return {
        stdout: '',
        elapsedMs: Math.round((performance.now() - startTime) * 10) / 10,
        error: `Não foi possível carregar /dados/${nome} (HTTP ${resposta.status}).`,
      };
    }
    const conteudo = await resposta.text();
    writeCsvPairToPyodide(pyodide, nome, conteudo);
    loadedFiles.add(nome);
  }

  const cleanedCode = stripPythonCommentsAndStrings(code);
  for (const pkg of ALLOWED_PYODIDE_PACKAGES) {
    const needed =
      new RegExp(`\\b${pkg}\\b`).test(cleanedCode) ||
      (pkg === 'pandas' && (checks ?? []).some((c) => /\bpd\b/.test(c.expr))) ||
      (pkg === 'numpy' && (checks ?? []).some((c) => /\bnp\b/.test(c.expr)));
    if (needed && !loadedPackages.has(pkg)) {
      const pesoAviso = pkg === 'pandas' ? ' (~37 MB)' : pkg === 'matplotlib' ? ' (~24 MB)' : '';
      onStatus?.(`A carregar biblioteca ${pkg}${pesoAviso} no navegador…`);
      await pyodide.loadPackage(pkg);
      loadedPackages.add(pkg);
    }
  }

  onStatus?.('A executar código Python…');
  onExecuting?.();

  pyodide.globals.set('__user_code__', code);
  pyodide.globals.set('__checks_json__', JSON.stringify(checks ?? []));

  const rawJson: string = await pyodide.runPythonAsync(SANDBOX_RUNNER_PYTHON);
  const parsed = JSON.parse(rawJson);
  return {
    stdout: parsed.stdout ?? '',
    table: parsed.table ?? undefined,
    checks: parsed.checks?.length ? parsed.checks : undefined,
    images: parsed.images?.length ? parsed.images : undefined,
    error: parsed.error ?? undefined,
    elapsedMs: Math.round((performance.now() - startTime) * 10) / 10,
  };
}
