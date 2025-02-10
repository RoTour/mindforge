import { QuestionSchema } from '@modules/Learning/entities/Question';
import * as IGetPendingQuestionsRepository from './IGetPendingQuestionsRepository';

type _JSONGetPendingQuestionsRepository = {
	getUserQuestions: IGetPendingQuestionsRepository.GetUserQuestions
}

export const JSONGetPendingQuestionsRepository = (): _JSONGetPendingQuestionsRepository => {
	return {
		getUserQuestions: async () => {
			try {
				const data = localStorage.getItem('questions');
				return QuestionSchema.array().parse(JSON.parse(data ?? ""));
			} catch (error) {
				console.error(error);
				return [];
			}
		}
	}
}