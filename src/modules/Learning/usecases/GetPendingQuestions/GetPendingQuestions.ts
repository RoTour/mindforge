// @modules/Learning/usecases/GetPendingQuestions.ts
import {
	UseCaseResponseBuilder,
	type InputFactory,
	type OutputFactory,
	type UseCase
} from '$lib/arch/UseCase';
import type { Question } from '@modules/Learning/entities/Question';
import * as IGetPendingQuestionsRepository from '@modules/Learning/usecases/GetPendingQuestions/repositories/IGetPendingQuestionsRepository';

type Input = InputFactory<
	{
		userId: string;
	},
	{
		getUserQuestions: IGetPendingQuestionsRepository.GetUserQuestions;
	}
>;

type Output = OutputFactory<{
	pendingQuestions: Question[];
}>;

export const GetPendingQuestions: UseCase<Input, Output> = ({ getUserQuestions }) => {
	return {
		execute: async ({ userId }) => {
			const questions = await getUserQuestions(userId);
			const results = questions.filter((question) => !question.lastAttemptDate);
			console.debug('GetPendingQuestions - Questions:', { questions, results });
			return UseCaseResponseBuilder.success(200, { pendingQuestions: results });
		}
	};
};
