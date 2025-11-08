// /Users/rotour/projects/mindforge/src/quiz-context/promotion/domain/PlannedQuestion.test.ts
import { QuestionId } from '$quiz/question/domain/QuestionId.valueObject';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlannedQuestion } from './PlannedQuestion.valueObject';
import { EndingDateBeforeStartingDateError } from './PlannedQuestion.errors';

describe('PlannedQuestion', () => {
	const questionId = new QuestionId();
	const now = new Date('2025-11-08T10:00:00.000Z');

	beforeAll(() => {
		vi.useFakeTimers();
	});

	afterAll(() => {
		vi.useRealTimers();
	});

	beforeEach(() => {
		vi.setSystemTime(now);
	});

	it('should have status NOT_DATE_DEFINED if no dates are provided', () => {
		const plannedQuestion = PlannedQuestion.create({ questionId });
		expect(plannedQuestion.status).toBe('NOT_DATE_DEFINED');
	});

	it('should have status NOT_DATE_DEFINED if only startingOn is provided', () => {
		const startingOn = new Date('2025-11-09T10:00:00.000Z');
		const plannedQuestion = PlannedQuestion.create({ questionId, startingOn });
		expect(plannedQuestion.status).toBe('NOT_DATE_DEFINED');
	});

	it('should have status NOT_DATE_DEFINED if only endingOn is provided', () => {
		const endingOn = new Date('2025-11-09T10:00:00.0-00Z');
		const plannedQuestion = PlannedQuestion.create({ questionId, endingOn });
		expect(plannedQuestion.status).toBe('NOT_DATE_DEFINED');
	});

	it('should have status PLANNED if startingOn is in the future', () => {
		const startingOn = new Date('2025-11-09T10:00:00.000Z');
		const endingOn = new Date('2025-11-10T10:00:00.000Z');
		const plannedQuestion = PlannedQuestion.create({ questionId, startingOn, endingOn });
		expect(plannedQuestion.status).toBe('PLANNED');
	});

	it('should have status ONGOING if startingOn is in the past and endingOn is in the future', () => {
		const startingOn = new Date('2025-11-07T10:00:00.000Z');
		const endingOn = new Date('2025-11-10T10:00:00.000Z');
		const plannedQuestion = PlannedQuestion.create({ questionId, startingOn, endingOn });
		expect(plannedQuestion.status).toBe('ONGOING');
	});

	it('should have status ONGOING if now is the same as startingOn', () => {
		const startingOn = new Date('2025-11-08T10:00:00.000Z');
		const endingOn = new Date('2025-11-10T10:00:00.000Z');
		const plannedQuestion = PlannedQuestion.create({ questionId, startingOn, endingOn });
		expect(plannedQuestion.status).toBe('ONGOING');
	});

	it('should have status ONGOING if now is the same as endingOn', () => {
		const startingOn = new Date('2025-11-07T10:00:00.000Z');
		const endingOn = new Date('2025-11-08T10:00:00.000Z');
		const plannedQuestion = PlannedQuestion.create({ questionId, startingOn, endingOn });
		expect(plannedQuestion.status).toBe('ONGOING');
	});

	it('should have status ENDED if endingOn is in the past', () => {
		const startingOn = new Date('2025-11-06T10:00:00.000Z');
		const endingOn = new Date('2025-11-07T10:00:00.000Z');
		const plannedQuestion = PlannedQuestion.create({ questionId, startingOn, endingOn });
		expect(plannedQuestion.status).toBe('ENDED');
	});

	it('should throw an error if endingOn is before startingOn', () => {
		const startingOn = new Date('2025-11-10T10:00:00.000Z');
		const endingOn = new Date('2025-11-09T10:00:00.000Z');

		expect(() => {
			PlannedQuestion.create({ questionId, startingOn, endingOn });
		}).toThrow(EndingDateBeforeStartingDateError);
	});
});
