import { QuestionSchema } from '@modules/Learning/entities/Question';
import { QuestionNotFound } from '../errors/QuestionNotFound';
import * as IValidateQuestionRepository from './IValidateQuestionRepository';

type _JSONValidateQuestionRepository = {
	getQuestionToValidate: IValidateQuestionRepository.GetQuestionToValidate;
};

export const JSONValidateQuestionRepository = (): _JSONValidateQuestionRepository => ({
	getQuestionToValidate: async (questionId) => {
		try {
			const data = localStorage.getItem('questions');
			const questions = QuestionSchema.array().parse(JSON.parse(data ?? ""));
			const result = questions.find((question) => question.id === questionId);
			if (!result) {
				throw new QuestionNotFound(questionId);
			}
			return result;
		} catch (error) {
			if (error instanceof QuestionNotFound) {
				throw error;
			}
			console.error(error);
			throw error;
		}
	}
});
