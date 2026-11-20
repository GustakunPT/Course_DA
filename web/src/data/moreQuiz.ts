// Perguntas extra de revisão, por etapa. Só a primeira pergunta de cada etapa (lesson.quiz) conta
// para o progresso; estas servem para confirmar que o conceito ficou.
//
// O conteúdo vive em moreQuiz.json para se poder editar sem mexer em TypeScript. Cada entrada:
//   { "question": "...", "options": ["...", "..."], "correctIndex": 1, "explanation": "..." }
// O teste tests/quizzes.test.ts confirma que todas as perguntas estão bem formadas.
import data from './moreQuiz.json';
import type { QuizSpec } from './types';

export const moreQuiz: Record<string, QuizSpec[]> = data;
