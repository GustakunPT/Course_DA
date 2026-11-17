import { describe, expect, it } from 'vitest';
import { escapeHtml } from '../src/ui/html';
import { renderOutputRegion } from '../src/ui/outputView';

describe('escapeHtml', () => {
  it('neutraliza HTML e aspas', () => {
    expect(escapeHtml(`<img src=x onerror="a('b')">&`)).toBe(
      '&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;',
    );
  });
});

describe('renderOutputRegion', () => {
  it('escapa o texto de uma consulta antes de o mostrar', () => {
    const html = renderOutputRegion(
      { kind: 'full', table: { columns: ['<b>nome</b>'], rows: [['<script>x</script>']] } },
      'sql',
    );
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<b>nome</b>');
  });

  it('mostra erros escapados', () => {
    const html = renderOutputRegion({ kind: 'error', errorText: '<i>falhou</i>' }, 'python');
    expect(html).toContain('&lt;i&gt;falhou&lt;/i&gt;');
  });

  it('mostra o botão Parar execução durante o carregamento Python e SQL', () => {
    const htmlPy = renderOutputRegion({ kind: 'loading', statusMessage: 'A executar…' }, 'python');
    expect(htmlPy).toContain('data-action="stop-code"');
    expect(htmlPy).toContain('Parar execução');

    const htmlSql = renderOutputRegion({ kind: 'loading', statusMessage: 'A executar consulta…' }, 'sql');
    expect(htmlSql).toContain('data-action="stop-code"');
  });
});
