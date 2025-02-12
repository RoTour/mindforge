// @modules/Learning/events/QuestionMiddleware.ts
import { errorHandled } from '@modules/Stats/events/ErrorActions';
import { AppOpened } from '@redux/AppLifecycle/AppActions';
import type { Middleware } from '@reduxjs/toolkit';
import { TRPCLearningGateways } from '../gateways/TRPCLearningGateways';
import { GetPendingQuestions } from '../usecases/GetPendingQuestions/GetPendingQuestions';
import {
	questionAnswered,
	questionAnswerSubmitted,
	questionCreated,
	questionPendingLoaded
} from './QuestionActions';
import { QuestionAnswerSubmittedEventHandler } from './QuestionAnswerSubmittedEventHandler';
import { notificationAdded } from '@redux/InAppNotifications/InAppNotificationsSlice';
import { v4 as uuid } from 'uuid';

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

	if (questionCreated.match(action)) {
		storeAPI.dispatch(notificationAdded({
			id: uuid(),
			message: 'Question created!',
			type: 'success'
		}));
	}
	return next(action);
};
