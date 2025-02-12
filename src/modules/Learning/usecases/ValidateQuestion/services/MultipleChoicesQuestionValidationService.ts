import { QuestionAnswerSeparator, type Question } from '../../../entities/Question';

export const MultipleChoicesQuestionValidationService = (separator: string = QuestionAnswerSeparator) => {
	return {
		validate: (question: Question, answer: string) => {
			const expectedAnswers = question.answer.split(separator);
			const userAnswers = answer.split(separator);
			return userAnswers.some((a) => expectedAnswers.includes(a.trim()));
		}
	}
};
