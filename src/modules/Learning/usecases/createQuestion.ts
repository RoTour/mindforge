// @modules/Learning/usecases/createQuestion.ts
import { UseCaseResponseBuilder, type InputFactory, type OutputFactory, type UseCase } from '$lib/arch/UseCase';
import type { CreateQuestionDto, Question } from '../entities/Question';

type Input = InputFactory<{
	dto: CreateQuestionDto;
}, {
	questionBuilder: (dto: CreateQuestionDto) => Question;
	callbacks: ((question: Question) => void)[];
}>;

type Output = OutputFactory<void>;

export const createQuestion: UseCase<Input, Output> = (deps)  => {
	const { questionBuilder, callbacks } = deps;
	return {
		execute: async ({ dto }) => {
			const question = questionBuilder(dto);
			callbacks.forEach(callback => callback(question));
			return UseCaseResponseBuilder.success(200, void 0);
		}
	};
}