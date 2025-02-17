// @modules/Learning/events/QuestionActions.ts
import { createAction } from '@reduxjs/toolkit';
import type { Question } from '../entities/Question';

export const QUESTION_ANSWER_SUBMITTED = 'QUESTION_ANSWER_SUBMITTED';
export const QUESTION_ANSWERED = 'QUESTION_ANSWERED';
export const QUESTION_CREATED = 'QUESTION_CREATED';
export const QUESTION_PENDING_LOADED = 'QUESTION_PENDING_LOADED';

export const questionAnswered = createAction<{
  userId: string;
  questionId: string;
  conceptId: string;
  wasCorrect: boolean;
  occurredAt: string;
  expectedAnswer: string;
}>('QUESTION_ANSWERED');

export const questionAnswerSubmitted = createAction<{
  questionId: string;
  propositions: string[];
}>('QUESTION_ANSWER_SUBMITTED');

export const questionCreated = createAction<Question>('QUESTION_CREATED');

export const questionPendingLoaded = createAction<{
  pendingQuestions: Question[];
  timeBeforeNextQuestion: { days: number; hours: number; minutes: number } | null;
}>('QUESTION_PENDING_LOADED');
