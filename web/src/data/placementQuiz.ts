import type { BackgroundLevel } from './diagnostic';

export interface PlacementQuestion {
  id: 'negocio' | 'sql' | 'python' | 'estatistica';
  pillar: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PlacementResult {
  answeredCount: number;
  totalQuestions: number;
  complete: boolean;
  score: number;
  suggestedBackground: BackgroundLevel;
  suggestedTrackId: string;
  suggestedLessonId: string;
  headline: string;
  detail: string;
}

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 'negocio',
    pillar: 'Negócio & Excel',
    question: 'Numa loja, 9 clientes gastam entre 2 € e 8 € e 1 restaurante gasta 120 €. Que métrica mostra o cliente típico?',
    options: [
      'A média aritmética',
      'A mediana (P50)',
      'A soma total',
      'O valor máximo',
    ],
    correctIndex: 1,
    explanation: 'A mediana resiste ao valor extremo de 120 € e representa o cliente habitual.',
  },
  {
    id: 'sql',
    pillar: 'SQL',
    question: 'Em SQL, queres ficar só com os produtos cuja soma de vendas ultrapassa 2 000 €. Onde colocas SUM(valor) > 2000?',
    options: [
      'No WHERE, antes do GROUP BY',
      'No HAVING, depois do GROUP BY',
      'No ORDER BY, antes do LIMIT',
      'No SELECT, com um alias AS',
    ],
    correctIndex: 1,
    explanation: 'WHERE filtra linhas brutas antes de agrupar; filtros sobre SUM/COUNT/AVG pertencem ao HAVING.',
  },
  {
    id: 'python',
    pillar: 'Python & Pandas',
    question: 'Em pandas, como filtras linhas onde preco > 3 E categoria == "Mercearia"?',
    options: [
      'df[df["preco"] > 3 and df["categoria"] == "Mercearia"]',
      'df[(df["preco"] > 3) & (df["categoria"] == "Mercearia")]',
      'df.where(preco > 3, categoria == "Mercearia")',
      'df.filter("preco > 3 AND categoria = Mercearia")',
    ],
    correctIndex: 1,
    explanation: 'Em pandas combinam-se máscaras booleanas com & (e parênteses em volta de cada condição).',
  },
  {
    id: 'estatistica',
    pillar: 'Estatística & A/B',
    question: 'Um teste A/B devolveu p-valor = 0,24. Qual é a conclusão correta?',
    options: [
      'Os dois grupos são garantidamente idênticos',
      'Não há provas suficientes para descartar acaso',
      'A versão B é 24% melhor do que a versão A',
      'Há 24% de certeza de que a versão B venceu',
    ],
    correctIndex: 1,
    explanation: 'p ≥ 0,05 não prova igualdade; indica apenas que a diferença observada ainda cabe no ruído normal.',
  },
];

export function evaluatePlacementAnswers(answers: Record<string, number>): PlacementResult {
  const totalQuestions = PLACEMENT_QUESTIONS.length;
  let answeredCount = 0;
  let score = 0;
  const hit = new Set<PlacementQuestion['id']>();

  for (const q of PLACEMENT_QUESTIONS) {
    const sel = answers[q.id];
    if (sel !== undefined && sel >= 0 && sel < q.options.length) {
      answeredCount++;
      if (sel === q.correctIndex) {
        score++;
        hit.add(q.id);
      }
    }
  }

  const complete = answeredCount === totalQuestions;

  if (score >= 3 && hit.has('sql') && hit.has('python')) {
    const startEstat = score === 4;
    return {
      answeredCount,
      totalQuestions,
      complete,
      score,
      suggestedBackground: 'tech',
      suggestedTrackId: startEstat ? 'bi' : 'pandas',
      suggestedLessonId: startEstat ? 'bi-03-curva-abc' : 'pd-01-dataframes',
      headline: `Nivelamento: ${score}/${totalQuestions} — Base técnica sólida`,
      detail: startEstat
        ? 'Dominas os fundamentos de negócio, SQL, Pandas e estatística: podes acelerar para Visualização/BI, Nível Profissional e Portfólio.'
        : 'Acertaste SQL e Pandas: sugerimos arrancar em 3. Pandas e dar foco forte a Estatística, BI e Portfólio.',
    };
  }

  if (score >= 2 || hit.has('negocio')) {
    const startSql = hit.has('python') && !hit.has('sql');
    return {
      answeredCount,
      totalQuestions,
      complete,
      score,
      suggestedBackground: 'negocio',
      suggestedTrackId: startSql ? 'sql' : 'python',
      suggestedLessonId: startSql ? 'sql-01-select' : 'py-01-sintaxe',
      headline: `Nivelamento: ${score}/${totalQuestions} — Boa leitura de negócio`,
      detail: startSql
        ? 'Já lês código Python/Pandas, mas SQL precisa de reforço: arranca direto em 2. SQL.'
        : 'Tens boa intuição analítica: começa em 1. Python (Sintaxe) para ganhar fluência rápida e avança para SQL.',
    };
  }

  return {
    answeredCount,
    totalQuestions,
    complete,
    score,
    suggestedBackground: 'zero',
    suggestedTrackId: 'python',
    suggestedLessonId: 'py-00-pensamento',
    headline: `Nivelamento: ${score}/${totalQuestions} — Construir a base desde o zero`,
    detail: 'Começa no Ponto Zero (py-00) e segue a sequência natural 1 → 8 sem saltar etapas: em poucas semanas ganhas base sólida.',
  };
}
