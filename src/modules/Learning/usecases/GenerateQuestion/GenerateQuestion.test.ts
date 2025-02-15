import { describe, test, expect } from 'vitest';
import { GenerateQuestions } from './GenerateQuestion';
import type { CreateQuestionDto } from '@modules/Learning/entities/Question';

describe('GenerateQuestion', () => {
	test('Given a topic, when generating a question, should try at most maxTries times', async () => {
		// Given
		const topic = 'test';
		const maxTries = 3;
		let nbAttempts = 0;
		const generateQuestions = () => new Promise<CreateQuestionDto[]>(resolve => {
			nbAttempts++;
			resolve([] as CreateQuestionDto[]);
		})
		const usecase = GenerateQuestions({ generateQuestions, maxTries });

		// When
		await usecase.execute({ topic });

		// Then
		expect(nbAttempts).toEqual(maxTries);
	});

	test('Given a topic, when generating a question, should stop trying after first success', async () => {
		// Given
		const topic = 'test';
		const maxTries = 3;
		let nbAttempts = 0;
		const generateQuestions = () => new Promise<CreateQuestionDto[]>(resolve => {
			nbAttempts++;
			resolve([] as CreateQuestionDto[]);
		})
		const usecase = GenerateQuestions({ generateQuestions, maxTries });

		// When
		await usecase.execute({ topic });

		// Then
		expect(nbAttempts).toEqual(1);
	})
})