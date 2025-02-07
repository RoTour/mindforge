import type { IQuestionValidationService } from '../interfaces/IQuestionValidationService';

export const SimpleQuestionValidationService = (): IQuestionValidationService => ({
	validate: (question, answer) => question.answer === answer
});
