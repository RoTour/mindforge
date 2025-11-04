// tests/mocks/serviceProvider.mock.ts

import { vi } from 'vitest';
import type { ServiceProvider } from '$lib/server/ServiceProvider';

/**
 * Creates a mock object that perfectly matches the ServiceProvider type.
 * Every method is a vi.fn(), allowing you to control its behavior in tests.
 */
export const createMockServiceProvider = (): ServiceProvider => ({
	// You only need to mock the methods you will actually interact with in your tests.
	// For full type safety, you can add all methods from each interface.
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
	}
});
