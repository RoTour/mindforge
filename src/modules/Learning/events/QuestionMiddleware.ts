// @modules/Learning/events/QuestionMiddleware.ts
import { errorHandled } from '@modules/Stats/events/ErrorActions';
import { AppOpened } from '@redux/AppLifecycle/AppActions';
import type { Middleware } from '@reduxjs/toolkit';
import { TRPCLearningGateways } from '../gateways/TRPCLearningGateways';
import { GetPendingQuestions } from '../usecases/GetPendingQuestions/GetPendingQuestions';
import {
	questionAnswered,
	questionAnswerSubmitted,
	questionPendingLoaded
} from './QuestionActions';
import { QuestionAnswerSubmittedEventHandler } from './QuestionAnswerSubmittedEventHandler';

export const QuestionMiddleware: Middleware = (storeAPI) => (next) => async (action) => {
	const trpcLearningGateway = TRPCLearningGateways();

	// Load pending questions when the app opens
	// or reload when a question has been answered
	if (AppOpened.match(action) || questionAnswered.match(action)) {
		const ucResult = await GetPendingQuestions({
			getUserQuestions: trpcLearningGateway.getUserQuestions
		}).execute({ userId: '' });

		if (!ucResult.isSuccess) {
			storeAPI.dispatch(errorHandled({ message: ucResult.message }));
			return;
		}

		storeAPI.dispatch(questionPendingLoaded(ucResult.data.pendingQuestions));
	}

	if (questionAnswerSubmitted.match(action)) {
		const eventHandler = QuestionAnswerSubmittedEventHandler({
			getQuestion: trpcLearningGateway.getQuestion,
			saveQuestion: trpcLearningGateway.saveQuestion,
			dispatch: storeAPI.dispatch
		});
		await eventHandler({
			questionId: action.payload.questionId,
			propositions: action.payload.propositions
		});
	}

	return next(action);
};
