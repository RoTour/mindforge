import type { Question } from '@modules/Learning/entities/Question';
import { describe, test, expect } from 'vitest';
import { ValidateQuestion } from './ValidateQuestion';
import { SimpleQuestionValidationService } from './services/SimpleQuestionValidationService';

describe('ValidateQuestion', () => {
	test('Given a SIMPLE question with a valid proposition, when validating the proposition, then it should return true', async () => {
		// Given
		const question = { answer: 'Paris' } as Question;
		const proposition = 'Paris';
		const usecase = ValidateQuestion({
			getQuestionAnswer: () => Promise.resolve(question),
			serviceProvider: () => SimpleQuestionValidationService()
		});

		// When
		const ucResult = await usecase.execute({ questionId: '', propositions: [proposition] });
		if (!ucResult.isSuccess) {
			throw new Error();
		}
		const result = ucResult.data.isCorrect;

		// Then
		expect(result).toBe(true);
	});
});
