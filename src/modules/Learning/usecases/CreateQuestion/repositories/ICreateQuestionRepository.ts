import type { Question } from '@modules/Learning/entities/Question';

export type StoreQuestion = (question: Question) => Promise<void>;