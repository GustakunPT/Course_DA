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

let pyodidePromise: Promise<any> | null = null;
let pandasLoaded = false;

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
    script.onerror = () => reject(new Error('Falha ao transferir o motor Python (Pyodide). Verifique a ligação à internet.'));
    document.head.appendChild(script);
  });
}

export async function getPyodideEngine(onStatus?: (msg: string) => void): Promise<any> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      onStatus?.('A iniciar Python 3.12 WebAssembly (primeira execução demora alguns segundos)…');
      await loadPyodideScript();
      const [pyodide, dataset] = await Promise.all([
        window.loadPyodide!({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' }),
        loadMerceariaDataset(),
      ]);

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
): Promise<PythonExecutionResult> {
  const start = performance.now();
  try {
    const pyodide = await getPyodideEngine(onStatus);
    const needsPandas = /\bpandas\b/.test(code) || (checks ?? []).some((c) => /\bpd\b/.test(c.expr));
    if (needsPandas && !pandasLoaded) {
      onStatus?.('A carregar biblioteca pandas no navegador…');
      await pyodide.loadPackage('pandas');
      pandasLoaded = true;
    }

    pyodide.globals.set('__user_code__', code);
    pyodide.globals.set('__checks_json__', JSON.stringify(checks ?? []));

    const rawJson: string = await pyodide.runPythonAsync(`
import io, json, math, sys, traceback

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

json.dumps({
    "stdout": _buf.getvalue(),
    "error": _err,
    "table": _table,
    "checks": _check_results
})
`);

    const parsed = JSON.parse(rawJson);
    return {
      stdout: parsed.stdout ?? '',
      table: parsed.table ?? undefined,
      checks: parsed.checks?.length ? parsed.checks : undefined,
      error: parsed.error ?? undefined,
      elapsedMs: Math.round((performance.now() - start) * 10) / 10,
    };
  } catch (err) {
    pyodidePromise = null;
    return {
      stdout: '',
      elapsedMs: Math.round((performance.now() - start) * 10) / 10,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
