import QuestionStorage from '../../QuestionStorage.json';
import * as IGetPendingQuestionsRepository from './IGetPendingQuestionsRepository';
import { QuestionSchema } from '@modules/Learning/entities/Question';

type _JSONGetPendingQuestionsRepository = {
	getUserQuestions: IGetPendingQuestionsRepository.GetUserQuestions
}

export const JSONGetPendingQuestionsRepository = (): _JSONGetPendingQuestionsRepository => {
	return {
		getUserQuestions: async () => {
			try {
				return QuestionSchema.array().parse(QuestionStorage);
			} catch (error) {
				console.error(error);
				return [];
			}
		}
	}
}