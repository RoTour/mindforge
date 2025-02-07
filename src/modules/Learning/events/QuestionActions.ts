import { createAction } from '@reduxjs/toolkit';
import type { Question } from '../entities/Question';

export const QUESTION_ANSWERED = 'QUESTION_ANSWERED';
export const QUESTION_CREATED = 'QUESTION_CREATED';

export const questionAnswered = createAction<{
  userId: string;
  questionId: string;
  conceptId: string;
  wasCorrect: boolean;
  occurredAt: string;
}>('QUESTION_ANSWERED');

export const questionCreated = createAction<Question>('QUESTION_CREATED');
