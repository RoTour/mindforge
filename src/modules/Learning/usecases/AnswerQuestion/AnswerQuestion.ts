import {
	UseCaseResponseBuilder,
	type InputFactory,
	type OutputFactory,
	type UseCase
} from '$lib/arch/UseCase';
import { AppDate } from '$lib/conversion/Dates';
import type { Question } from '@modules/Learning/entities/Question';
import { SaveQuestionError } from './errors/SaveQuestionError';
import * as IAnswerQuestionRepository from './repositories/IAnswerQuestionRepository';

type Input = InputFactory<
	{
		questionId: string;
		success: boolean;
	},
	{
		getQuestion: IAnswerQuestionRepository.GetQuestion;
		saveQuestion: IAnswerQuestionRepository.SaveQuestion;
	}
>;

type Output = OutputFactory<void>;

export const AnswerQuestion: UseCase<Input, Output> = ({ getQuestion, saveQuestion }) => {
	return {
		execute: async ({ questionId, success }) => {
			// Load question data
			let question: Question;
			try {
				const questionFetched = await getQuestion(questionId);
				if (!questionFetched) throw new Error("Question not found");
				question = questionFetched;
			} catch {
				return UseCaseResponseBuilder.error(404, new Error("Question not found").message);
			}

			// Update question
			question.lastAttemptDate = AppDate.now();
			if (success) question.successStreak++;
			else question.successStreak = 0;

			// Save question
			try {
				await saveQuestion(question);
			} catch {
				return UseCaseResponseBuilder.error(500, new SaveQuestionError(questionId).message);
			}
			return UseCaseResponseBuilder.success(200, void 0);
		}
	};
};
