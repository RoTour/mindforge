import type { IMessageQueue } from '$ddd/interfaces/IMessageQueue';
import { DomainEventPublisher } from '$lib/ddd/events/DomainEventPublisher';
import { BullMQAdapter } from '$lib/server/bullmq/BullMQ.adapter';
import type { PrismaClient } from '$prisma/client';
import { ScheduleQuestionSessionCommand } from '$quiz/common/domain/commands/ScheduleQuestionSession.command';
import { CreateQuestionSessionUsecase } from '$quiz/question-session/application/CreateQuestionSessionUsecase';
import { PrismaQuestionSessionRepository } from '$quiz/question-session/infra/QuestionSessionRepository/PrismaQuestionSessionRepository';
import { Question } from '$quiz/question/domain/Question.entity';
import { PrismaQuestionRepository } from '$quiz/question/infra/repositories/PrismaQuestionRepository';
import { Teacher } from '$quiz/teacher/domain/Teacher.entity';
import { PrismaTeacherRepository } from '$quiz/teacher/infra/TeacherRepository/PrismaTeacherRepository';
import { Queue } from 'bullmq';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getPrismaTestClient, getTestRedisConnection } from '../../../../test/setupIntegration';
import { Period } from '../domain/Period.valueObject';
import { Promotion } from '../domain/Promotion.entity';
import { PrismaPromotionRepository } from '../infra/PromotionRepository/PrismaPromotionRepository';
import { ScheduleSessionOnPromotionQuestionPlanned } from './listeners/ScheduleSessionOnPromotionQUestionPlanned.listener';
import { PlanQuestionUsecase } from './PlanQuestion.usecase';

describe('Full Planning Flow Integration Test', () => {
	let prisma: PrismaClient;
	let messageQueue: IMessageQueue;
	let promotionRepository: PrismaPromotionRepository;
	let questionRepository: PrismaQuestionRepository;
	let teacherRepository: PrismaTeacherRepository;
	let planQuestionUsecase: PlanQuestionUsecase;
	let scheduleCommandQueue: Queue;

	// --- Default Entities for tests ---
	let teacher: Teacher;
	let question: Question;

	beforeEach(async () => {
		vi.resetAllMocks();

		// --- Explicitly initialize components for the test ---
		prisma = getPrismaTestClient();
		const redisConnection = getTestRedisConnection();
		messageQueue = new BullMQAdapter(redisConnection);
		scheduleCommandQueue = new Queue(ScheduleQuestionSessionCommand.type, {
			connection: redisConnection
		});
		await scheduleCommandQueue.obliterate(); // Clear any jobs from previous tests

		// Initialize Repositories and Services
		promotionRepository = new PrismaPromotionRepository(prisma);
		questionRepository = new PrismaQuestionRepository(prisma);
		teacherRepository = new PrismaTeacherRepository(prisma);
		const questionSessionRepository = new PrismaQuestionSessionRepository(prisma);
		const createQuestionSessionUsecase = new CreateQuestionSessionUsecase(
			questionSessionRepository
		);
		const scheduleSessionListener = new ScheduleSessionOnPromotionQuestionPlanned(
			messageQueue,
			createQuestionSessionUsecase
		);

		planQuestionUsecase = new PlanQuestionUsecase(
			promotionRepository,
			questionRepository,
			scheduleSessionListener
		);

		// Seed the database with common entities
		teacher = Teacher.create({ authUserId: 'teacher-for-flow-test' });
		question = Question.create({ authorId: teacher.id, text: 'A sample question' });
		await teacherRepository.save(teacher);
		await questionRepository.save(question);
	});

	afterEach(async () => {
		// Unsubscribe listeners and clean queue to ensure test isolation
		DomainEventPublisher.reset();
		await scheduleCommandQueue.obliterate();
	});

	test('When a question is planned for the future, a job is scheduled', async () => {
		// --- GIVEN ---
		const promotion = Promotion.create({
			name: 'Test Promotion',
			period: new Period(2025),
			teacherId: teacher.id
		});
		await promotionRepository.save(promotion);

		const startingOn = new Date(Date.now() + 1000 * 60 * 60); // 1 hour in the future
		const endingOn = new Date(Date.now() + 1000 * 60 * 120); // 2 hours in the future

		// --- WHEN ---
		await planQuestionUsecase.execute({
			promotionId: promotion.id.id(),
			questionId: question.id.id(),
			startingOn,
			endingOn
		});

		// --- THEN ---
		const delayedJobs = await scheduleCommandQueue.getDelayed();
		expect(delayedJobs).toHaveLength(1);
		expect(delayedJobs[0].name).toBe(ScheduleQuestionSessionCommand.type);
		expect(delayedJobs[0].data.questionId).toBe(question.id.id());

		const session = await prisma.questionSession.findFirst({
			where: { promotionId: promotion.id.id() }
		});
		expect(session).toBeNull();
	});

	test('When a question is planned for the present, a session is created immediately', async () => {
		// --- GIVEN ---
		const promotion = Promotion.create({
			name: 'Test Promotion 2',
			period: new Period(2025),
			teacherId: teacher.id
		});
		await promotionRepository.save(promotion);

		const startingOn = new Date(Date.now() - 1000 * 60); // 1 minute in the past
		const endingOn = new Date(Date.now() + 1000 * 60 * 60); // 1 hour in the future

		// --- WHEN ---
		await planQuestionUsecase.execute({
			promotionId: promotion.id.id(),
			questionId: question.id.id(),
			startingOn,
			endingOn
		});

		// --- THEN ---
		const session = await prisma.questionSession.findFirst({
			where: {
				promotionId: promotion.id.id(),
				questionId: question.id.id()
			}
		});
		expect(session).not.toBeNull();
		expect(session?.status).toBe('ACTIVE');

		const delayedJobs = await scheduleCommandQueue.getDelayed();
		expect(delayedJobs).toHaveLength(0);
	});
});
