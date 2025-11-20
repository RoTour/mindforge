import type { PrismaClient } from '$prisma/client';
import { Queue, Worker, type RedisOptions } from 'bullmq';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { getPrismaTestClient, getTestRedisConnection } from '../../../../test/setupIntegration';
import { AutoGradeAnswerCommand } from '../../common/domain/commands/AutoGradeAnswer.command';
import { PrismaQuestionRepository } from '../../question/infra/repositories/PrismaQuestionRepository';
import { startAutoGradeAnswerWorker } from '../adapters/AutoGradeAnswerWorker.adapter';
import { Grade } from '../domain/Grade.valueObject';
import type { IGradingService } from '../domain/IGradingService';
import { PrismaQuestionSessionRepository } from '../infra/QuestionSessionRepository/PrismaQuestionSessionRepository';

describe('Auto Grading Integration', () => {
	let prisma: PrismaClient;
	let redisConnection: RedisOptions;
	let worker: Worker;
	let queue: Queue;

	beforeAll(async () => {
		prisma = getPrismaTestClient();
		redisConnection = getTestRedisConnection();
		queue = new Queue(AutoGradeAnswerCommand.type, { connection: redisConnection });
	});

	afterAll(async () => {
		await queue.close();
		if (worker) {
			await worker.close();
		}
	});

	it('should auto-grade an answer', async () => {
		// 1. Setup Data
		const teacher = await prisma.teacher.create({
			data: { authUserId: 'teacher-1' }
		});

		const promotion = await prisma.promotion.create({
			data: {
				name: 'Test Class',
				baseYear: 2024,
				teacherId: teacher.id
			}
		});

		const question = await prisma.question.create({
			data: {
				text: 'What is 2 + 2?',
				authorId: teacher.id,
				keyNotions: [
					{ text: 'addition', weight: 1 },
					{ text: 'math', weight: 1 }
				]
			}
		});

		const student = await prisma.student.create({
			data: {
				name: 'Test Student',
				email: 'student@test.com'
			}
		});

		const session = await prisma.questionSession.create({
			data: {
				questionId: question.id,
				promotionId: promotion.id,
				startedAt: new Date(),
				endsAt: new Date(Date.now() + 10000),
				status: 'ACTIVE'
			}
		});

		const answer = await prisma.answer.create({
			data: {
				questionSessionId: session.id,
				studentId: student.id,
				text: 'It is 4',
				submittedAt: new Date()
			}
		});

		// 2. Mock Grading Service
		const mockGradingService = {
			gradeAnswer: vi.fn().mockResolvedValue(
				Grade.create({
					skillsMastered: ['addition'],
					skillsToReinforce: [],
					comment: 'Good job!'
				})
			)
		};

		// 3. Start Worker
		const questionSessionRepo = new PrismaQuestionSessionRepository(prisma);
		const questionRepo = new PrismaQuestionRepository(prisma);

		worker = startAutoGradeAnswerWorker(
			redisConnection,
			questionSessionRepo,
			questionRepo,
			mockGradingService as IGradingService
		);
		await worker.waitUntilReady();

		// 4. Add Job
		await queue.add(AutoGradeAnswerCommand.type, {
			questionSessionId: session.id,
			studentId: student.id
		});

		// 5. Wait for processing
		await new Promise((resolve) => setTimeout(resolve, 5000));

		// 6. Verify
		const updatedAnswer = await prisma.answer.findUnique({
			where: { id: answer.id },
			include: { autoGrade: true }
		});

		expect(updatedAnswer?.autoGrade).toBeDefined();
		expect(updatedAnswer?.autoGrade?.skillsMastered).toContain('addition');
		expect(updatedAnswer?.autoGrade?.comment).toBe('Good job!');
	}, 30000);
});
