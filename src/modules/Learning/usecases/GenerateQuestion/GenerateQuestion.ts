import {
	UseCaseResponseBuilder,
	type InputFactory,
	type OutputFactory,
	type UseCase
} from '$lib/arch/UseCase';
import type { CreateQuestionDto } from '@modules/Learning/entities/Question';
import * as IGenerateQuestionsRepository from './repositories/IGenerateQuestionsRepository';

type Input = InputFactory<
	{
		topic: string;
	},
	{
		maxTries: number;
		generateQuestions: IGenerateQuestionsRepository.GenerateQuestionsFromTopic;
	}
>;
type Output = OutputFactory<{
	questionDtos: CreateQuestionDto[];
}>;

export type GenerateQuestionsUseCaseOutput = Output

export const GenerateQuestions: UseCase<Input, Output> = ({ generateQuestions, maxTries }) => {
	return {
		execute: async ({ topic }) => {
			for (let i = 0; i < maxTries; i++) {
				try {
					const dtos = await generateQuestions(topic);
					return UseCaseResponseBuilder.success(200, { questionDtos: dtos });
				} catch (e) {
					console.debug('Error:', e);
					console.warn(`Failed to generate question after ${i + 1} tries`);
				}
			}
			return UseCaseResponseBuilder.error(500, 'Failed to generate question after max tries');
		}
	};
};
