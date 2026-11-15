import { describe, expect, it } from 'vitest';
import { parseCsvLine, parseCsvRecords } from '../src/engines/csvEngine';

describe('parseCsvLine', () => {
  it('separa por vírgulas', () => {
    expect(parseCsvLine('a,b,c')).toEqual(['a', 'b', 'c']);
  });
  it('respeita vírgulas dentro de aspas', () => {
    expect(parseCsvLine('"Silva, Ana",Porto')).toEqual(['Silva, Ana', 'Porto']);
  });
  it('converte aspas duplicadas numa aspa', () => {
    expect(parseCsvLine('"diz ""olá""",x')).toEqual(['diz "olá"', 'x']);
  });
  it('mantém campos vazios', () => {
    expect(parseCsvLine('2025-01-03,Leite,,0.89')).toEqual(['2025-01-03', 'Leite', '', '0.89']);
  });
});

describe('parseCsvRecords', () => {
  it('usa o cabeçalho como chaves e aceita CRLF', () => {
    expect(parseCsvRecords('id,nome\r\n1,Pão\r\n2,Leite\r\n')).toEqual([
      { id: '1', nome: 'Pão' },
      { id: '2', nome: 'Leite' },
    ]);
  });
  it('preenche colunas em falta com texto vazio', () => {
    expect(parseCsvRecords('a,b\n1')).toEqual([{ a: '1', b: '' }]);
  });
  it('devolve lista vazia sem linhas de dados', () => {
    expect(parseCsvRecords('a,b')).toEqual([]);
  });
});
