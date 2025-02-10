import type { Question } from '@modules/Learning/entities/Question';

export type GetQuestion = (questionId: string) => Promise<Question | undefined>;
export type SaveQuestion = (question: Question) => Promise<void>;