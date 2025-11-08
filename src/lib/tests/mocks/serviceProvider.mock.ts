// Mock the module
vi.mock(import('../../server/ServiceProvider'), () => {
	return {
		ServiceProvider: createFullMockServiceProvider()
	};
});
// tests/mocks/serviceProvider.mock.ts
import { vi } from 'vitest';
import type { ServiceProvider } from '$lib/server/ServiceProvider';

// Create a type that converts all methods to vi.fn() mocks OR allows real implementations
export type DeepMockServiceProvider = {
	[K in keyof ServiceProvider]:
		| ServiceProvider[K]
		| {
				[M in keyof ServiceProvider[K]]: ServiceProvider[K][M] extends (...args: any[]) => any
					? ReturnType<typeof vi.fn<ServiceProvider[K][M]>>
					: ServiceProvider[K][M];
		  };
};

/**
 * Creates a partial mock of the ServiceProvider.
 * Only the methods you specify will be mocked, others remain undefined.
 * Returns properly typed mock functions with mockResolvedValue, mockReturnValue, etc.
 */
export const createMockServiceProvider = (
	overrides: Partial<{
		[K in keyof ServiceProvider]: Partial<{
			[M in keyof ServiceProvider[K]]: ServiceProvider[K][M];
		}>;
	}> = {}
): DeepMockServiceProvider => {
	const mockProvider: any = {
		PromotionRepository: {},
		StudentRepository: {},
		TeacherRepository: {},
		StudentListParser: {},
		PromotionStudentsQueries: {},
		EnrollQueries: {},
		TeacherQueries: {}
	};

	// Apply overrides and convert to mocks
	for (const [serviceKey, serviceMethods] of Object.entries(overrides)) {
		if (serviceMethods) {
			for (const [methodKey, methodValue] of Object.entries(serviceMethods)) {
				if (typeof methodValue === 'function') {
					mockProvider[serviceKey][methodKey] = vi.fn(methodValue);
				} else {
					mockProvider[serviceKey][methodKey] = vi.fn();
				}
			}
		}
	}

	return mockProvider as DeepMockServiceProvider;
};

// Alternative: Create a full mock with all methods (for when you need everything)
export const createFullMockServiceProvider = (): DeepMockServiceProvider => ({
	PromotionRepository: {
		findAll: vi.fn(),
		findById: vi.fn(),
		save: vi.fn()
	},
	StudentRepository: {
		findAll: vi.fn(),
		findById: vi.fn(),
		save: vi.fn(),
		saveMany: vi.fn()
	},
	TeacherRepository: {
		findAll: vi.fn(),
		findById: vi.fn(),
		save: vi.fn()
	},
	StudentsOverviewQueries: {
		getStudentsFromPromotion: vi.fn()
	},
	TeacherPromotionsQueries: {
		listTeacherPromotions: vi.fn()
	},
	StudentListParser: {
		parse: vi.fn()
	},
	PromotionStudentsQueries: {
		getStudentsFromPromotion: vi.fn()
	},
	EnrollQueries: {
		getPromotionDetails: vi.fn()
	},
	TeacherQueries: {
		findByAuthUserId: vi.fn()
	},
	QuestionRepository: {
		save: vi.fn(),
		findById: vi.fn(),
		findByAuthorId: vi.fn()
	},
	TeacherQuestionsQueries: {
		getAllOwnQuestionsForTeacher: vi.fn(),
		getOwnQuestionsForPromotion: vi.fn()
	}
});
