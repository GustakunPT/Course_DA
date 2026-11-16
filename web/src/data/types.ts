import type { PythonCheckSpec } from '../engines/pythonEngine';
import type { GitRepoState } from '../engines/gitEngine';

export type EngineKind = 'python' | 'sql' | 'git';

export interface ReferenceRow {
  syntax: string;
  meaning: string;
  example: string;
}

export interface SqlChallengeSpec {
  /** Nome curto do exercício de treino; o desafio principal não precisa. */
  title?: string;
  description: string;
  starterSql: string;
  solutionSql: string;
  hint: string;
  validate: (columns: string[], rows: (string | number | null)[][]) => { passed: boolean; message: string };
}

export interface PythonChallengeSpec {
  /** Nome curto do exercício de treino; o desafio principal não precisa. */
  title?: string;
  description: string;
  starterCode: string;
  solutionCode: string;
  checks: PythonCheckSpec[];
}

export interface GitChallengeSpec {
  /** Nome curto do exercício de treino; o desafio principal não precisa. */
  title?: string;
  description: string;
  starterCommands: string;
  solutionCommands: string;
  hint: string;
  validate: (state: GitRepoState, output: string) => { passed: boolean; message: string };
}

export interface QuizSpec {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  code: string;
  title: string;
  lede: string;
  analogyTitle: string;
  analogyBody: string;
  concepts: string[];
  beginnerSteps?: string[];
  proPractice?: string;
  commonPitfall?: string;
  /** Explicação mais longa, em parágrafos, para quem nunca programou. */
  explained?: string[];
  /** Um erro típico: o código que o provoca, a mensagem do Python e como corrigir. */
  errorDemo?: { code: string; message: string; fix: string };
  referenceTitle: string;
  referenceRows: ReferenceRow[];
  engine: EngineKind;
  exampleCode: string;
  pythonChallenge?: PythonChallengeSpec;
  /** Exercícios de treino extra (opcionais): repetem o conceito com outros dados. */
  practice?: PythonChallengeSpec[];
  /** Exercícios de treino SQL extra (não contam para o progresso). */
  practiceSql?: SqlChallengeSpec[];
  /** Exercícios de treino Git extra (não contam para o progresso). */
  practiceGit?: GitChallengeSpec[];
  sqlChallenge?: SqlChallengeSpec;
  gitChallenge?: GitChallengeSpec;
  quiz: QuizSpec;
  /** Perguntas extra de revisão; só a primeira (quiz) conta para o progresso. */
  moreQuiz?: QuizSpec[];
}

export interface Track {
  id: string;
  shortTitle: string;
  fullTitle: string;
  summary: string;
  engineLabel: string;
  lessons: Lesson[];
}

export interface CheatsheetEntry {
  category: 'Python' | 'SQL' | 'Pandas' | 'NumPy & Gráficos' | 'Estatística' | 'Git' | 'BI & DAX';
  topic: string;
  syntax: string;
  description: string;
  tryEngine?: EngineKind;
  trySnippet?: string;
}
