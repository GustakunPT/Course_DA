import { loadMerceariaDataset } from './csvEngine';

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

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<any>;
  }
}

const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

let pyodidePromise: Promise<any> | null = null;
let pandasLoaded = false;
// Ficheiros extra (além dos CSV da Mercearia) já escritos no sistema de ficheiros do Pyodide.
const ficheirosCarregados = new Set<string>();

type PyodideLoader = () => Promise<any>;

// No browser o Pyodide vem da CDN; nos testes (Node) é trocado pelo pacote npm "pyodide".
let pyodideLoader: PyodideLoader = async () => {
  await loadPyodideScript();
  return window.loadPyodide!({ indexURL: PYODIDE_INDEX_URL });
};

/** Só para testes: usa outro carregador do Pyodide e recomeça do zero. */
export function setPyodideLoaderForTests(loader: PyodideLoader): void {
  pyodideLoader = loader;
  pyodidePromise = null;
  pandasLoaded = false;
  ficheirosCarregados.clear();
}

function loadPyodideScript(): Promise<void> {
  if (window.loadPyodide) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pyodide]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Falha ao transferir o motor Pyodide da CDN.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
    // SRI: o browser recusa o script se a CDN servir um ficheiro diferente do v0.26.4 oficial.
    // Ao atualizar a versão, recalcule: curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A
    script.integrity = 'sha384-i3R37b3tF+HWudsUf1VSEOY2YxwSNMqY8DQa9Z0O3xh+NkJ9o+yjcGyIi5huj+nB';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.dataset.pyodide = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao transferir o motor Python (Pyodide). Verifica a ligação à internet.'));
    document.head.appendChild(script);
  });
}

export async function getPyodideEngine(onStatus?: (msg: string) => void): Promise<any> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      onStatus?.('A iniciar Python 3.12 WebAssembly (primeira execução demora alguns segundos)…');
      const [pyodide, dataset] = await Promise.all([pyodideLoader(), loadMerceariaDataset()]);

      pyodide.FS.mkdirTree('/home/pyodide/dados');
      pyodide.FS.mkdirTree('/home/dados');
      for (const [name, content] of Object.entries(dataset.rawCsvs)) {
        pyodide.FS.writeFile(`/home/pyodide/dados/${name}`, content, { encoding: 'utf8' });
        pyodide.FS.writeFile(`/home/dados/${name}`, content, { encoding: 'utf8' });
      }
      return pyodide;
    })();
  }
  return pyodidePromise;
}

export async function runPythonCode(
  code: string,
  checks?: PythonCheckSpec[],
  onStatus?: (msg: string) => void,
  ficheirosExtra: string[] = [],
): Promise<PythonExecutionResult> {
  const start = performance.now();
  try {
    const pyodide = await getPyodideEngine(onStatus);
    for (const nome of ficheirosExtra) {
      if (ficheirosCarregados.has(nome)) continue;
      onStatus?.(`A carregar ${nome}…`);
      const resposta = await fetch(`/dados/${nome}`);
      if (!resposta.ok) {
        return {
          stdout: '',
          elapsedMs: Math.round((performance.now() - start) * 10) / 10,
          error: `Não foi possível carregar /dados/${nome} (HTTP ${resposta.status}).`,
        };
      }
      const conteudo = await resposta.text();
      pyodide.FS.writeFile(`/home/pyodide/dados/${nome}`, conteudo, { encoding: 'utf8' });
      pyodide.FS.writeFile(`/home/dados/${nome}`, conteudo, { encoding: 'utf8' });
      ficheirosCarregados.add(nome);
    }
    const needsPandas = /\bpandas\b/.test(code) || (checks ?? []).some((c) => /\bpd\b/.test(c.expr));
    if (needsPandas && !pandasLoaded) {
      onStatus?.('A carregar biblioteca pandas no navegador…');
      await pyodide.loadPackage('pandas');
      pandasLoaded = true;
    }
    // Módulos que o Pyodide não traz por omissão (ex.: sqlite3) são carregados a partir dos imports.
    await pyodide.loadPackagesFromImports(code);

    pyodide.globals.set('__user_code__', code);
    pyodide.globals.set('__checks_json__', JSON.stringify(checks ?? []));

    const rawJson: string = await pyodide.runPythonAsync(`
import io, json, math, os, sys, traceback, warnings
# Sem janela gráfica no browser: o matplotlib desenha em memória e a bancada mostra o PNG.
os.environ["MPLBACKEND"] = "AGG"

# O pandas do Pyodide avisa que vai exigir Pyarrow no futuro; para quem aprende é só ruído.
warnings.filterwarnings("ignore", message=r"(?s).*Pyarrow will become a required dependency")

_buf = io.StringIO()
_old_out, _old_err = sys.stdout, sys.stderr
sys.stdout = _buf
sys.stderr = _buf

_ns = {"__name__": "__main__"}
_err = None
_table = None
_check_results = []

try:
    import ast
    _tree = ast.parse(__user_code__, mode="exec")
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

    _specs = json.loads(__checks_json__)
    _ns["math"] = math

    # correr_com(total=80) volta a correr o código do aluno com outros dados de entrada:
    # as atribuições de topo a essas variáveis passam a usar os novos valores. Assim as
    # verificações testam a lógica e não apenas o valor final (que se podia escrever à mão).
    def correr_com(**novos):
        _arvore = ast.parse(__user_code__, mode="exec")
        for _no in _arvore.body:
            if isinstance(_no, ast.Assign) and any(isinstance(_t, ast.Name) and _t.id in novos for _t in _no.targets):
                _nome = next(_t.id for _t in _no.targets if isinstance(_t, ast.Name) and _t.id in novos)
                _no.value = ast.Name(id="__novo_" + _nome, ctx=ast.Load())
        ast.fix_missing_locations(_arvore)
        _ns2 = {"__name__": "__main__"}
        _ns2.update({"__novo_" + _k: _v for _k, _v in novos.items()})
        _antes = sys.stdout
        sys.stdout = io.StringIO()
        try:
            exec(compile(_arvore, "<bancada>", "exec"), _ns2)
        finally:
            sys.stdout = _antes
        return _ns2

    _ns["correr_com"] = correr_com
    for _sp in _specs:
        try:
            _actual = eval(_sp["actualExpr"], _ns)
        except Exception:
            _actual = "não definido"
        try:
            _ok = bool(eval(_sp["expr"], _ns))
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
        _plt.figure(_num).savefig(_png, format="png", dpi=90, bbox_inches="tight")
        _images.append(base64.b64encode(_png.getvalue()).decode("ascii"))
    _plt.close("all")

json.dumps({
    "stdout": _buf.getvalue(),
    "error": _err,
    "table": _table,
    "checks": _check_results,
    "images": _images
})
`);

    const parsed = JSON.parse(rawJson);
    return {
      stdout: parsed.stdout ?? '',
      table: parsed.table ?? undefined,
      checks: parsed.checks?.length ? parsed.checks : undefined,
      images: parsed.images?.length ? parsed.images : undefined,
      error: parsed.error ?? undefined,
      elapsedMs: Math.round((performance.now() - start) * 10) / 10,
    };
  } catch (err) {
    pyodidePromise = null;
    ficheirosCarregados.clear(); // um novo Pyodide começa sem os ficheiros extra
    return {
      stdout: '',
      elapsedMs: Math.round((performance.now() - start) * 10) / 10,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
