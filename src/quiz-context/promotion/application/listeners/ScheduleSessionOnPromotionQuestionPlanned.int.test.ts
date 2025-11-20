// @path: /Users/rotour/projects/mindforge/src/quiz-context/promotion/application/listeners/ScheduleSessionOnPromotionQuestionPlanned.int.test.ts
import { getPrismaTestClient, getTestRedisConnection } from '../../../../../test/setupIntegration';
import { describe, test, expect, beforeEach } from 'vitest';
import { BullMQAdapter } from '$lib/server/bullmq/BullMQ.adapter';
import { PrismaQuestionSessionRepository } from '$quiz/question-session/infra/QuestionSessionRepository/PrismaQuestionSessionRepository';
import { CreateQuestionSessionUsecase } from '$quiz/question-session/application/CreateQuestionSessionUsecase';
import { ScheduleSessionOnPromotionQuestionPlanned } from './ScheduleSessionOnPromotionQUestionPlanned.listener';
import { PromotionQuestionPlanned } from '../../domain/events/PromotionQuestionPlanned.event';
import type { PrismaClient, QuestionSession } from '$prisma/client';
import { Teacher } from '$quiz/teacher/domain/Teacher.entity';
import { Promotion } from '../../domain/Promotion.entity';
import { Question } from '$quiz/question/domain/Question.entity';
import { Period } from '$quiz/promotion/domain/Period.valueObject';
import type { RedisConnection, RedisOptions, Worker } from 'bullmq';
import { startScheduleQuestionSessionWorker } from '$quiz/question-session/adapters/ScheduleQuestionSessionWorker.adapter';

// Helper function to poll the database until a condition is met or timeout
async function poll<T>(
	callback: () => Promise<T | null>,
	timeout = 10000,
	interval = 500
): Promise<T | null> {
	const startTime = Date.now();
	while (Date.now() - startTime < timeout) {
		const result = await callback();
		if (result) {
			return result;
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
	return null; // Timeout reached
}

describe('Integration-Listener: ScheduleSessionOnPromotionQuestionPlanned', () => {
	let prisma: PrismaClient;
	let redis: RedisOptions;

	let questionSessionRepository: PrismaQuestionSessionRepository;

	let mq: BullMQAdapter;
	let worker: Worker;

	beforeEach(() => {
		prisma = getPrismaTestClient();
		redis = getTestRedisConnection();

		questionSessionRepository = new PrismaQuestionSessionRepository(prisma);

		mq = new BullMQAdapter(redis);
		worker = startScheduleQuestionSessionWorker(redis, questionSessionRepository);
	});

	test('should schedule a job and have the worker create a question session in the DB', async () => {
		// --- ARRANGE ---
		const createQuestionSessionUsecase = new CreateQuestionSessionUsecase(
			questionSessionRepository
		);
		const listener = new ScheduleSessionOnPromotionQuestionPlanned(
			mq,
			createQuestionSessionUsecase
		);

		// 3. Create prerequisite data in the test DB
		// The teacher entity is linked to an auth user, so we create a dummy user first.
		const user = await prisma.user.create({
			data: {
				id: 'test-auth-user-id',
				email: 'teacher@test.com',
				name: 'Test Teacher'
			}
		});

		const teacher = Teacher.create({ authUserId: user.id });
		await prisma.teacher.create({
			data: { id: teacher.id.id(), authUserId: teacher.authUserId }
		});

		const promotion = Promotion.create({
			name: 'test-promo',
			teacherId: teacher.id,
			period: new Period(2025)
		});
		const savedPromotion = await prisma.promotion.create({
			data: {
				id: promotion.id.id(),
				name: promotion.name,
				baseYear: promotion.period.baseYear,
				teacherId: promotion.teacherId.id()
			}
		});

		const question = Question.create({
			text: 'test-question',
			authorId: teacher.id,
			keyNotions: []
		});
		const savedQuestion = await prisma.question.create({
			data: {
				id: question.id.id(),
				text: question.text,
				authorId: question.authorId.id()
			}
		});

		// 4. Define the event with a start time a few seconds in the future
		const delay = 2000; // 2 seconds
		const startingOn = new Date(Date.now() + delay);
		const endingOn = new Date(Date.now() + delay + 10000); // 10 seconds duration
		const event = new PromotionQuestionPlanned(
			savedPromotion.id,
			savedQuestion.id,
			startingOn,
			endingOn
		);

		// --- ACT ---
		// Handle the event, which should add a job to the queue
		await listener.handle(event);

		// --- ASSERT ---
		// Poll the database to see if the worker processed the job and created the session
		const createdSession = await poll<QuestionSession>(() =>
			prisma.questionSession.findFirst({
				where: {
					promotionId: savedPromotion.id,
					questionId: savedQuestion.id
				}
			})
		);

		// Verify the session was created
		expect(createdSession).not.toBeNull();
		expect(createdSession?.promotionId).toBe(savedPromotion.id);
		expect(createdSession?.questionId).toBe(savedQuestion.id);
	}, 15000); // Increase test timeout to allow for job processing
});
