import { describe, expect, test } from 'vitest';
import type { Question } from '../../../entities/Question';
import { MultipleChoicesQuestionValidationService } from './MultipleChoicesQuestionValidationService';

describe('MultipleChoicesQuestionValidationService', () => {
	test("Given a question and a correct answer, when validating the answer, then it should return true", () => {
		// Given
		const question = { answer: 'Paris' } as Question;
		const answer = 'Paris';

		// When
		const result = MultipleChoicesQuestionValidationService().validate(question, answer);

		// Then
		expect(result).toBe(true);
	});

	test("Given a question expecting multiple answers, should return true if the answer contains all of them", () => {
		// Given
		const question = { answer: 'Paris|||Berlin' } as Question;
		const answer = 'Berlin|||Paris';

		// When
		const result = MultipleChoicesQuestionValidationService().validate(question, answer);

		// Then
		expect(result).toBe(true);
	});
});