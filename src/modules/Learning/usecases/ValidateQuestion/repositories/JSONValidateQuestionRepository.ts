import * as IValidateQuestionRepository from './IValidateQuestionRepository';
import QuestionStorage from '../../QuestionStorage.json';
import { QuestionSchema } from '@modules/Learning/entities/Question';
import { QuestionNotFound } from '../errors/QuestionNotFound';

type _JSONValidateQuestionRepository = {
	getQuestionToValidate: IValidateQuestionRepository.GetQuestionToValidate;
};

export const JSONValidateQuestionRepository = (): _JSONValidateQuestionRepository => ({
	getQuestionToValidate: async (questionId) => {
		try {
			const questions = QuestionSchema.array().parse(QuestionStorage);
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
