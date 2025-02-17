// @modules/Learning/events/QuestionMiddleware.ts
import { errorHandled } from '@modules/Stats/events/ErrorActions';
import { AppOpened } from '@redux/AppLifecycle/AppActions';
import { notificationAdded } from '@redux/InAppNotifications/InAppNotificationsSlice';
import type { Middleware } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import { TRPCLearningGateways } from '../gateways/TRPCLearningGateways';
import { GetPendingQuestions } from '../usecases/GetPendingQuestions/GetPendingQuestions';
import {
	questionAnswered,
	questionAnswerSubmitted,
	questionCreated,
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

		const { pendingQuestions, timeBeforeNextQuestion } = ucResult.data;
		storeAPI.dispatch(
			questionPendingLoaded({
				pendingQuestions,
				timeBeforeNextQuestion: timeBeforeNextQuestion
					? timeBeforeNextQuestion
					: null
			})
		);
	}

	// If a question was answered, show success notification
	if (questionAnswered.match(action)) {
		storeAPI.dispatch(
			notificationAdded({
				id: uuid(),
				message: action.payload.wasCorrect
					? 'Correct! 🎉'
					: `You got it wrong 😔\n ${action.payload.expectedAnswer}`,
				type: action.payload.wasCorrect ? 'success' : 'error'
			})
		);
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

	if (questionCreated.match(action)) {
		storeAPI.dispatch(
			notificationAdded({
				id: uuid(),
				message: 'Question created!',
				type: 'success'
			})
		);
	}
	return next(action);
};
