import type { Question } from '@modules/Learning/entities/Question';

export type GetUserQuestions = (userId: string) => Promise<Question[]>;