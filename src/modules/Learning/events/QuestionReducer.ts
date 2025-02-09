// @modules/Learning/events/QuestionReducer.ts
import { createReducer } from '@reduxjs/toolkit';
import type { Question } from '../entities/Question';
import { questionPendingLoaded } from './QuestionActions';

interface QuestionState {
	pendingQuestions: Question[];
}

const initialState: QuestionState = {
	pendingQuestions: []
};

export const questionReducer = createReducer(initialState, (builder) => {
  builder.addCase(questionPendingLoaded, (state, action) => {
		state.pendingQuestions = action.payload;
	});
});
