import { UseCaseResponseBuilder, type InputFactory, type OutputFactory, type UseCase } from '$lib/arch/UseCase';

type Input = InputFactory<void, void>;

type Output = OutputFactory<void>;

export const answerQuestion: UseCase<Input, Output> = ()  => {
	return {
		execute: async () => {
			return UseCaseResponseBuilder.success(200, void 0);
		}
	};
}