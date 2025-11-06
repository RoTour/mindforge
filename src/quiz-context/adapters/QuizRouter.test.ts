// Example test file
import '$lib/tests/mocks/serviceProvider.mock';
import type { DeepMockServiceProvider } from '$lib/tests/mocks/serviceProvider.mock';
import { beforeEach, describe, test, vi, expect } from 'vitest';
import type { Context } from '$lib/server/trpc/context';
import { TeacherId } from '$quiz/domain/TeacherId.valueObject';
import type { CreatePromotionCommand } from '$quiz/application/CreatePromotion.usecase';
import { QuizRouter } from './QuizRouter';
import { InMemoryPromotionRepository } from '$quiz/infra/PromotionRepository/InMemoryPromotionRepository';
import { mock } from 'node:test';

const { ServiceProvider: mockedServiceProvider } = (await import(
	'$lib/server/ServiceProvider'
)) as {
	ServiceProvider: DeepMockServiceProvider;
};

describe('Unit-QuizRouter', () => {
	const trpcCreateContext = (): Context => {
		return {
			authUserId: 'auth-user-1234',
			teacher: {
				id: new TeacherId()
			}
		};
	};

	const caller = QuizRouter.createCaller(trpcCreateContext());

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('Non-authenticated users should get UNAUTHORIZED', async () => {
		const createPromotionPayload: Omit<CreatePromotionCommand, 'teacherId'> = {
			baseYear: 2025,
			name: 'Promotion 2025',
			students: []
		};

		const caller = QuizRouter.createCaller(() => ({ authUserId: null, teacher: null }));

		await expect(caller.createPromotion(createPromotionPayload)).rejects.toHaveProperty(
			'code',
			'UNAUTHORIZED'
		);
	});

	test('Non-teacher users should get FORBIDDEN', async () => {
		const createPromotionPayload: Omit<CreatePromotionCommand, 'teacherId'> = {
			baseYear: 2025,
			name: 'Promotion 2025',
			students: []
		};

		mockedServiceProvider.TeacherQueries.findByAuthUserId.mockResolvedValueOnce(null);

		await expect(caller.createPromotion(createPromotionPayload)).rejects.toHaveProperty(
			'code',
			'FORBIDDEN'
		);
	});

	test('Should create promotion for authenticated teacher', async () => {
		const createPromotionPayload: Omit<CreatePromotionCommand, 'teacherId'> = {
			baseYear: 2025,
			name: 'Promotion 2025',
			students: []
		};

		const mockTeacher = {
			id: new TeacherId(),
			name: 'John Doe',
			authUserId: 'auth-user-1234'
		};

		mockedServiceProvider.TeacherQueries.findByAuthUserId.mockResolvedValueOnce(mockTeacher);
		mockedServiceProvider.PromotionRepository = new InMemoryPromotionRepository();
		mockedServiceProvider.TeacherRepository.findById.mockResolvedValueOnce(mockTeacher);

		await caller.createPromotion(createPromotionPayload);

		const promotions = await mockedServiceProvider.PromotionRepository.findAll();
		expect(promotions.length).toBe(1);
		expect(promotions[0].name).toBe('Promotion 2025');
	});
});
