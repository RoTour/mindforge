// tests/mocks/serviceProvider.mock.ts
import type { ServiceProvider } from '$lib/server/ServiceProvider';
import type { PrismaClient } from '$prisma/client';
import type { CheckAndLinkStudentByEmailUsecase } from '$quiz/student/application/CheckAndLinkStudentByEmail.usecase';
import { vi } from 'vitest';

export function createMockServiceProvider(overrides?: Partial<ServiceProvider>): ServiceProvider {
	return {
		StudentQueries: {
			getStudentIdByAuthUserId: vi.fn(),
			getStudentPromotions: vi.fn(),
			getStudentSummaryStats: vi.fn(),
			isStudentInPromotion: vi.fn(),
			doesUnlinkedStudentExistWithEmail: vi.fn(),
			...overrides?.StudentQueries
		},
		StudentQuestionQueries: {
			getQuestionDetails: vi.fn(),
			...overrides?.StudentQuestionQueries
		},
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
			findStudentByEmail: vi.fn(),
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
			findActiveByPromotionIdForStudent: vi.fn(),
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
			prisma: {} as unknown as PrismaClient,
			...overrides?.clients
		},
		services: {
			ImageStudentListParser: {
				parse: vi.fn()
			},
			EmailService: {
				sendEmail: vi.fn()
			},
			StudentVerificationService: {
				requestVerification: vi.fn(),
				verify: vi.fn()
			},
			...overrides?.services
		},
		UnlinkedStudentsQueries: {
			getUnlinkedStudents: vi.fn(),
			...overrides?.UnlinkedStudentsQueries
		},
		CheckAndLinkStudentByEmailUsecase: {
			execute: vi.fn(),
			...overrides?.CheckAndLinkStudentByEmailUsecase
		} as unknown as CheckAndLinkStudentByEmailUsecase
	} satisfies ServiceProvider;
}
