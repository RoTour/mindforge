// @modules/Learning/events/QuestionAnswerSubmittedEventHandler.ts
import { AppDate } from '$lib/conversion/Dates';
import { errorHandled } from '@modules/Stats/events/ErrorActions';
import type { Dispatch } from '@reduxjs/toolkit';
import { TRPCLearningGateways } from '../gateways/TRPCLearningGateways';
import { AnswerQuestion } from '../usecases/AnswerQuestion/AnswerQuestion';
import * as IAnswerQuestionRepository from '../usecases/AnswerQuestion/repositories/IAnswerQuestionRepository';
import { ValidateQuestion } from '../usecases/ValidateQuestion/ValidateQuestion';
import { questionAnswered } from './QuestionActions';
import { ExpectedAnswerBuilder } from '../constructors/ExpectedAnswerBuilder';

type _QuestionAnswerSubmittedEventHandler = {
	saveQuestion: IAnswerQuestionRepository.SaveQuestion;
	getQuestion: IAnswerQuestionRepository.GetQuestion;
	dispatch: Dispatch;
};

export const QuestionAnswerSubmittedEventHandler =
	({ saveQuestion, getQuestion, dispatch }: _QuestionAnswerSubmittedEventHandler) =>
	async ({ questionId, propositions }: { questionId: string; propositions: string[] }) => {
		const trpcGateway = TRPCLearningGateways();
		const validateUseCase = ValidateQuestion({
			getQuestionAnswer: trpcGateway.getQuestionToValidate,
			expectedAnswerFormatter: (question) => ExpectedAnswerBuilder(question).build()
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
				occurredAt: AppDate.now().toString(),
				expectedAnswer: validationResult.data.expectedAnswer
			})
		);
	};
