// @modules/Learning/events/QuestionAnswerSubmittedEventHandler.ts
import { AppDate } from '$lib/conversion/Dates';
import { errorHandled } from '@modules/Stats/events/ErrorActions';
import type { Dispatch } from '@reduxjs/toolkit';
import { AnswerQuestion } from '../usecases/AnswerQuestion/AnswerQuestion';
import * as IAnswerQuestionRepository from '../usecases/AnswerQuestion/repositories/IAnswerQuestionRepository';
import { JSONValidateQuestionRepository } from '../usecases/ValidateQuestion/repositories/JSONValidateQuestionRepository';
import { ValidateQuestion } from '../usecases/ValidateQuestion/ValidateQuestion';
import { questionAnswered } from './QuestionActions';

type _QuestionAnswerSubmittedEventHandler = {
	saveQuestion: IAnswerQuestionRepository.SaveQuestion;
	getQuestion: IAnswerQuestionRepository.GetQuestion;
	dispatch: Dispatch;
};

export const QuestionAnswerSubmittedEventHandler =
	({ saveQuestion, getQuestion, dispatch }: _QuestionAnswerSubmittedEventHandler) =>
	async ({ questionId, propositions }: { questionId: string; propositions: string[] }) => {
		const validateRepository = JSONValidateQuestionRepository();
		const validateUseCase = ValidateQuestion({
			getQuestionAnswer: validateRepository.getQuestionToValidate
		});
		const validationResult = await validateUseCase.execute({
			questionId,
			propositions
		});
		if (!validationResult.isSuccess) {
			dispatch(errorHandled({ message: validationResult.message }));
			return;
		}

		const answerQuestionUseCase = AnswerQuestion({
			getQuestion,
			saveQuestion
		});
		await answerQuestionUseCase.execute({
			questionId,
			success: validationResult.data.isCorrect
		});

		dispatch(
			questionAnswered({
				userId: '',
				questionId,
				conceptId: '',
				wasCorrect: validationResult.data.isCorrect,
				occurredAt: AppDate.now().toString()
			})
		);
	};
