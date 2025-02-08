import type { IQuestionValidationService } from './IQuestionValidationService';

export const SimpleQuestionValidationService = (): IQuestionValidationService => ({
	validate: (question, answer) => question.answer === answer
});
