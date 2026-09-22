import { InterviewQuestion, Level, QuestionKind } from '../core/models/content.models';
import { foundationsQuestions } from './questions/foundations.questions';
import { mlQuestions } from './questions/ml.questions';
import { llmQuestions } from './questions/llm.questions';
import { engineeringQuestions } from './questions/engineering.questions';

export const QUESTIONS: InterviewQuestion[] = [
  ...foundationsQuestions,
  ...mlQuestions,
  ...llmQuestions,
  ...engineeringQuestions,
];

/** Categories in curriculum order, so the filter list reads as a progression. */
export const QUESTION_CATEGORIES: string[] = [
  'Python',
  'NumPy & pandas',
  'Statistics',
  'Mathematics',
  'Machine Learning',
  'Model Evaluation',
  'Deep Learning',
  'Computer Vision',
  'NLP',
  'Transformers',
  'LLMs',
  'RAG',
  'Fine-Tuning',
  'AI Agents',
  'AI Engineering',
  'MLOps',
  'AI System Design',
];

export const QUESTION_KINDS: QuestionKind[] = [
  'conceptual',
  'coding',
  'mathematical',
  'scenario',
  'system-design',
  'debugging',
  'architecture',
];

export function questionById(id: string): InterviewQuestion | undefined {
  return QUESTIONS.find((question) => question.id === id);
}

export function countByCategory(category: string): number {
  return QUESTIONS.filter((question) => question.category === category).length;
}

export function countByDifficulty(difficulty: Level): number {
  return QUESTIONS.filter((question) => question.difficulty === difficulty).length;
}
