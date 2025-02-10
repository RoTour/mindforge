// @modules/Learning/usecases/CreateQuestion/CreateQuestion.ts
import {
	UseCaseResponseBuilder,
	type InputFactory,
	type OutputFactory,
	type UseCase
} from '$lib/arch/UseCase';
import type { CreateQuestionDto, Question } from '../../entities/Question';
import * as ICreateQuestionRepository from './repositories/ICreateQuestionRepository';

type Input = InputFactory<
	{
		dto: CreateQuestionDto;
	},
	{
		questionBuilder: (dto: CreateQuestionDto) => Question;
		storeQuestion: ICreateQuestionRepository.StoreQuestion;
		callbacks: ((question: Question) => void)[];
	}
>;

type Output = OutputFactory<Question>;

export const CreateQuestion: UseCase<Input, Output> = (deps) => {
	const { questionBuilder, callbacks, storeQuestion } = deps;
	return {
		execute: async ({ dto }) => {
			const question = questionBuilder(dto);
			await storeQuestion(question);
			callbacks.forEach((callback) => callback(question));
			return UseCaseResponseBuilder.success(200, question);
		}
	};
};
