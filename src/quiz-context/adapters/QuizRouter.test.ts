vi.mock(import('../../lib/server/ServiceProvider'), () => {
	return {
		ServiceProvider: createMockServiceProvider()
	};
});

import { beforeEach, describe, test, vi } from 'vitest';
import type { Context } from '$lib/server/trpc/context';
import { TeacherId } from '$quiz/domain/TeacherId.valueObject';
import { createMockServiceProvider } from '$lib/tests/mocks/serviceProvider.mock';
import type { CreatePromotionCommand } from '$quiz/application/CreatePromotion.usecase';
import { expect } from 'storybook/internal/test';
import { QuizRouter } from './QuizRouter';

const { ServiceProvider: mockedServiceProvider } = await import('$lib/server/ServiceProvider');

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

	test('Non-authentified users should get FORBIDDEN', async () => {
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
});
