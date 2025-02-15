import type { Question } from '@modules/Learning/entities/Question';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { GetPendingQuestions } from './GetPendingQuestions';
import { DateTime } from 'luxon';

describe('GetPendingQuestions', () => {
	const baseDate = DateTime.utc(2000, 1, 1);
	beforeEach(() => {
		vi.resetAllMocks();
		vi.setSystemTime(baseDate.toJSDate());
	});
	test('Given a question with no last attempt, should be returned as pending question', async () => {
		const questions: Question[] = [{ id: '1', lastAttemptDate: undefined } as Question];

		const result = await GetPendingQuestions({
			getUserQuestions: async () => questions
		}).execute({ userId: '' });

		if (!result.isSuccess) throw new Error('Usecase failed: ' + result.message);
		expect(result.data.pendingQuestions).toContainEqual(questions[0]);
	});

	test('Given a function with a last attempt failed, pending questions should include it one day after', async () => {
		const questions: Question[] = [
			{
				id: '1',
				lastAttemptDate: baseDate.minus({ day: 1 }).toISODate() ?? undefined,
				successStreak: 1
			} as Question
		];

		const result = await GetPendingQuestions({
			getUserQuestions: async () => questions
		}).execute({ userId: '' });

		if (!result.isSuccess) throw new Error('Usecase failed: ' + result.message);
		expect(result.data.pendingQuestions).toContainEqual(questions[0]);
	});

	test('Given a question with a last attempt succeeded, and a streak of 4, should not be returned after one day', async () => {
		const questions: Question[] = [
			{
				id: '1',
				lastAttemptDate: baseDate.minus({ day: 1 }).toISODate() ?? undefined,
				successStreak: 4
			} as Question
		];

		const result = await GetPendingQuestions({
			getUserQuestions: async () => questions
		}).execute({ userId: '' });

		if (!result.isSuccess) throw new Error('Usecase failed: ' + result.message);
		expect(result.data.pendingQuestions).not.toContainEqual(questions[0]);
	});

	test("Given a question with a last attempt succeeded and a streak of 4, should be returned after 5 days", async () => {
		const questions: Question[] = [
			{
				id: '1',
				lastAttemptDate: baseDate.minus({ day: 5 }).toISODate() ?? undefined,
				successStreak: 4
			} as Question
		];

		const result = await GetPendingQuestions({
			getUserQuestions: async () => questions
		}).execute({ userId: '' });

		if (!result.isSuccess) throw new Error('Usecase failed: ' + result.message);
		expect(result.data.pendingQuestions).toContainEqual(questions[0]);
	});
});
