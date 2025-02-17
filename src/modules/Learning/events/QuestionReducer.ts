// @modules/Learning/events/QuestionReducer.ts
import { createReducer } from '@reduxjs/toolkit';
import type { Question } from '../entities/Question';
import { questionPendingLoaded } from './QuestionActions';

interface QuestionState {
	pendingQuestions: Question[];
	timeBeforeNextQuestion: { days: number; hours: number; minutes: number } | null;
}

const initialState: QuestionState = {
	pendingQuestions: [],
	timeBeforeNextQuestion: null
};

export const questionReducer = createReducer(initialState, (builder) => {
	builder.addCase(questionPendingLoaded, (state, action) => {
		state.pendingQuestions = action.payload.pendingQuestions;
		state.timeBeforeNextQuestion = action.payload.timeBeforeNextQuestion
	});
});
