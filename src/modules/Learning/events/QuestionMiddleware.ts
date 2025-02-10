// @modules/Learning/events/QuestionMiddleware.ts
import type { Middleware } from '@reduxjs/toolkit';
import { GetPendingQuestions } from '../usecases/GetPendingQuestions/GetPendingQuestions';
import { JSONGetPendingQuestionsRepository } from '../usecases/GetPendingQuestions/repositories/JSONGetPendingQuestionsRepository';
import {
	questionAnswered,
	questionAnswerSubmitted,
	questionPendingLoaded
} from './QuestionActions';
import { errorHandled } from '@modules/Stats/events/ErrorActions';
import { AppOpened } from '@redux/AppLifecycle/AppActions';
import { QuestionAnswerSubmittedEventHandler } from './QuestionAnswerSubmittedEventHandler';
import { JSONAnswerQuestionRepository } from '../usecases/AnswerQuestion/repositories/JSONAnswerQuestionRepository';

const repository = JSONGetPendingQuestionsRepository();

export const QuestionMiddleware: Middleware = (storeAPI) => (next) => async (action) => {
		if (AppOpened.match(action)) {
		localStorage.setItem(
			'questions',
			JSON.stringify([
				{
					id: 'f63f1b5b-7135-41c9-a9fe-e7d24844a5b3',
					prompt: 'What is the capital of France?',
					options: ['Paris', 'London', 'Berlin', 'Rome'],
					answer: 'Paris',
					type: 'SIMPLE',
					successStreak: 0,
					intervalModifier: 0
				}
			])
		);
	}

	// Load pending questions when the app opens
	// or reload when a question has been answered
	if (AppOpened.match(action) || questionAnswered.match(action)) {
		const ucResult = await GetPendingQuestions({
			getUserQuestions: repository.getUserQuestions
		}).execute({ userId: '' });

		if (!ucResult.isSuccess) {
			storeAPI.dispatch(errorHandled({ message: ucResult.message }));
			return;
		}

		storeAPI.dispatch(questionPendingLoaded(ucResult.data.pendingQuestions));
	}

	if (questionAnswerSubmitted.match(action)) {
		const repository = JSONAnswerQuestionRepository();
		const eventHandler = QuestionAnswerSubmittedEventHandler({
			getQuestion: repository.getQuestion,
			saveQuestion: repository.saveQuestion,
			dispatch: storeAPI.dispatch
		});
		eventHandler({
			questionId: action.payload.questionId,
			propositions: action.payload.propositions
		});
	}

	return next(action);
};
