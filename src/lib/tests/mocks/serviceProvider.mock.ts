// __tests__/helpers/mockServiceProvider.ts
import { vi } from 'vitest';
import type { ServiceProvider } from '$lib/server/ServiceProvider';
import { getPrismaTestClient } from '../../../../test/setupIntegration';

export function createMockServiceProvider(overrides?: Partial<ServiceProvider>): ServiceProvider {
	return {
		PromotionRepository: {
			save: vi.fn(),
			findById: vi.fn(),
			findAll: vi.fn(),
			findByOwnerId: vi.fn(),
			...overrides?.PromotionRepository
		},
		StudentRepository: {
			save: vi.fn(),
			findById: vi.fn(),
			findAll: vi.fn(),
			saveMany: vi.fn(),
			...overrides?.StudentRepository
		},
		TeacherRepository: {
			save: vi.fn(),
			findById: vi.fn(),
			findAll: vi.fn(),
			...overrides?.TeacherRepository
		},
		QuestionRepository: {
			save: vi.fn(),
			findById: vi.fn(),
			findByAuthorId: vi.fn(),
			...overrides?.QuestionRepository
		},
		QuestionSessionRepository: {
			save: vi.fn(),
			findById: vi.fn(),
			findActiveByPromotionId: vi.fn(),
			...overrides?.QuestionSessionRepository
		},
		StudentListParser: {
			parse: vi.fn(),
			...overrides?.StudentListParser
		},
		PromotionStudentsQueries: {
			getStudentsFromPromotion: vi.fn(),
			...overrides?.PromotionStudentsQueries
		},
		EnrollQueries: {
			getPromotionDetails: vi.fn(),
			...overrides?.EnrollQueries
		},
		TeacherQueries: {
			findByAuthUserId: vi.fn(),
			...overrides?.TeacherQueries
		},
		TeacherPromotionsQueries: {
			listTeacherPromotions: vi.fn(),
			...overrides?.TeacherPromotionsQueries
		},
		StudentsOverviewQueries: {
			getStudentsFromPromotion: vi.fn(),
			...overrides?.StudentsOverviewQueries
		},
		TeacherQuestionsQueries: {
			getAllOwnQuestionsForTeacher: vi.fn(),
			getOwnQuestionsForPromotion: vi.fn(),
			getPlannedQuestionsForPromotion: vi.fn(),
			...overrides?.TeacherQuestionsQueries
		},
		MessageQueue: {
			add: vi.fn(),
			process: vi.fn(),
			...overrides?.MessageQueue
		},
		eventListeners: {
			scheduleSessionOnPromotionQuestionPlanned: {
				handle: vi.fn()
			},
			...overrides?.eventListeners
		},
		clients: {
			prisma: getPrismaTestClient(),
			...overrides?.clients
		},
		services: {
			ImageStudentListParser: {
				parse: vi.fn()
			},
			...overrides?.services
		}
	} satisfies ServiceProvider;
}
