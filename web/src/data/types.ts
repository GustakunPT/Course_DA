import type { PythonCheckSpec } from '../engines/pythonEngine';
import type { GitRepoState } from '../engines/gitEngine';

export type EngineKind = 'python' | 'sql' | 'git';

export interface ReferenceRow {
  syntax: string;
  meaning: string;
  example: string;
}

export interface SqlChallengeSpec {
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
  referenceTitle: string;
  referenceRows: ReferenceRow[];
  engine: EngineKind;
  exampleCode: string;
  pythonChallenge?: PythonChallengeSpec;
  /** Exercícios de treino extra (opcionais): repetem o conceito com outros dados. */
  practice?: PythonChallengeSpec[];
  sqlChallenge?: SqlChallengeSpec;
  gitChallenge?: GitChallengeSpec;
  quiz: QuizSpec;
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
  category: 'Python' | 'SQL' | 'Pandas' | 'Git' | 'BI & DAX';
  topic: string;
  syntax: string;
  description: string;
  tryEngine?: EngineKind;
  trySnippet?: string;
}
