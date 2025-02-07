// $lib/modules/Learning/events/QuestionReducer.ts
import { createReducer } from '@reduxjs/toolkit';
import type { Question } from '../entities/Question';
import { questionCreated } from './QuestionActions';

interface QuestionState {
  [questionId: string]: Question
}

const initialState: QuestionState = {};

export const questionReducer = createReducer(initialState, (builder) => {
  builder.addCase(questionCreated, (state, action) => {
    state[action.payload.id] = action.payload;
  });
});
