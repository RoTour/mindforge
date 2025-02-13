import { UseCaseResponseBuilder, type InputFactory, type OutputFactory, type UseCase } from '$lib/arch/UseCase';
import { QuestionAnswerSeparator, type QuestionType } from '@modules/Learning/entities/Question';
import * as IValidateQuestionRepository from './repositories/IValidateQuestionRepository';
import { MultipleChoicesQuestionValidationService } from './services/MultipleChoicesQuestionValidationService';
import { SimpleQuestionValidationService } from './services/SimpleQuestionValidationService';

type Input = InputFactory<{
	questionId: string;
	propositions: string[];
}, {
	getQuestionAnswer: IValidateQuestionRepository.GetQuestionToValidate;
	serviceProvider?: IValidateQuestionRepository.QuestionValidationServiceProvider;
	expectedAnswerFormatter?: IValidateQuestionRepository.ExpectedAnswerFormatter
}>;

export type ValidateQuestionOutput = {
	isCorrect: boolean;
	expectedAnswer: string;
};
type Output = OutputFactory<ValidateQuestionOutput>;


export const ValidateQuestion: UseCase<Input, Output> = ({ getQuestionAnswer, serviceProvider, expectedAnswerFormatter })  => {
	const defaultServiceProvider = (type: QuestionType) => {
		switch (type) {
			case 'MULTIPLE_CHOICES':
				return MultipleChoicesQuestionValidationService();
			default:
				return SimpleQuestionValidationService();
		}
	}
	return {
		execute: async ({ questionId, propositions }) => {
			const question = await getQuestionAnswer(questionId);
			if (!question) return UseCaseResponseBuilder.error(404, "Question to validate not found");
			const validationService = serviceProvider ? serviceProvider(question.type) : defaultServiceProvider(question.type);
			const isCorrect = validationService.validate(question, propositions.join(QuestionAnswerSeparator));
			return UseCaseResponseBuilder.success(200, { 
				isCorrect,
				expectedAnswer: expectedAnswerFormatter ? expectedAnswerFormatter(question) : question.answer });
		}
	};
}