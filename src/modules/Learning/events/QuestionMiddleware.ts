// @modules/Learning/events/QuestionMiddleware.ts
import type { Middleware } from '@reduxjs/toolkit';
import { GetPendingQuestions } from '../usecases/GetPendingQuestions/GetPendingQuestions';
import { JSONGetPendingQuestionsRepository } from '../usecases/GetPendingQuestions/repositories/JSONGetPendingQuestionsRepository';
import { questionPendingLoaded } from './QuestionActions';
import { errorHandled } from '@modules/Stats/events/ErrorActions';
import { AppOpened } from '@redux/AppLifecycle/AppActions';

const repository = JSONGetPendingQuestionsRepository();

export const QuestionMiddleware: Middleware = (storeAPI) => (next) => async (action) => {
	console.debug('Question middleware action:', action);
	if (!AppOpened.match(action)) return next(action);

	const ucResult = await GetPendingQuestions({
		getUserQuestions: repository.getUserQuestions
	}).execute({ userId: '' });

	if (!ucResult.isSuccess) {
		storeAPI.dispatch(errorHandled({ message: ucResult.message }));
		return;
	}

	storeAPI.dispatch(questionPendingLoaded(ucResult.data.pendingQuestions));

	return next(action);
};
