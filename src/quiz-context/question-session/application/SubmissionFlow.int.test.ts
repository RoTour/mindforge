// src/quiz-context/question-session/application/SubmissionFlow.int.test.ts

import type { IMessageQueue } from '$ddd/interfaces/IMessageQueue';
import { BullMQAdapter } from '$lib/server/bullmq/BullMQ.adapter';
import type { PrismaClient } from '$prisma/client';
import { ProcessStudentAnswerCommand } from '$quiz/common/domain/commands/ProcessStudentAnswer.command';
import { Period } from '$quiz/promotion/domain/Period.valueObject';
import { Promotion } from '$quiz/promotion/domain/Promotion.entity';
import { PrismaPromotionRepository } from '$quiz/promotion/infra/PromotionRepository/PrismaPromotionRepository';
import { Question } from '$quiz/question/domain/Question.entity';
import { PrismaQuestionRepository } from '$quiz/question/infra/repositories/PrismaQuestionRepository';
import { Student } from '$quiz/student/domain/Student.entity';
import { PrismaStudentRepository } from '$quiz/student/infra/StudentRepository/PrismaStudentRepository';
import { Teacher } from '$quiz/teacher/domain/Teacher.entity';
import { PrismaTeacherRepository } from '$quiz/teacher/infra/TeacherRepository/PrismaTeacherRepository';
import type { ConnectionOptions } from 'bullmq';
import { Queue, Worker } from 'bullmq';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getPrismaTestClient, getTestRedisConnection } from '../../../../test/setupIntegration';
import { startRegisterStudentAnswerWorker } from '../adapters/RegisterStudentAnswerWorker.adapter';
import { QuestionSession } from '../domain/QuestionSession.entity';
import { PrismaQuestionSessionRepository } from '../infra/QuestionSessionRepository/PrismaQuestionSessionRepository';
import { AcceptAnswerUsecase } from './AcceptAnswerUsecase';
import type { IDomainEventListener } from '$ddd/interfaces/IDomainEventListener';

describe('Submission Flow Integration Test', () => {
	let prisma: PrismaClient;
	let redisConnection: ConnectionOptions;
	let messageQueue: IMessageQueue;
	let acceptAnswerUsecase: AcceptAnswerUsecase;
	let answerCommandQueue: Queue;
	let worker: Worker;

	// --- Default Entities for tests ---
	let teacher: Teacher;
	let question: Question;
	let promotion: Promotion;
	let student: Student;
	let questionSession: QuestionSession;

	beforeEach(async () => {
		vi.resetAllMocks();

		// --- Initialize components for the test ---
		prisma = getPrismaTestClient();
		redisConnection = getTestRedisConnection();
		messageQueue = new BullMQAdapter(redisConnection);
		answerCommandQueue = new Queue(ProcessStudentAnswerCommand.type, {
			connection: redisConnection
		});
		await answerCommandQueue.obliterate(); // Clear any jobs from previous tests

		// --- Initialize Repositories ---
		const questionSessionRepository = new PrismaQuestionSessionRepository(prisma);
		const teacherRepository = new PrismaTeacherRepository(prisma);
		const questionRepository = new PrismaQuestionRepository(prisma);
		const promotionRepository = new PrismaPromotionRepository(prisma);
		const studentRepository = new PrismaStudentRepository(prisma);

		// --- Initialize Usecases ---
		acceptAnswerUsecase = new AcceptAnswerUsecase(messageQueue);

		// --- Seed the database ---
		teacher = Teacher.create({ authUserId: 'teacher-for-submission-test' });
		await teacherRepository.save(teacher);

		question = Question.create({ authorId: teacher.id, text: 'A sample question for submission' });
		await questionRepository.save(question);

		promotion = Promotion.create({
			name: 'Test Promotion Submission',
			period: new Period(2025),
			teacherId: teacher.id
		});
		await promotionRepository.save(promotion);

		student = Student.create({
			name: 'John',
			lastName: 'Doe'
		});
		await studentRepository.save(student);

		questionSession = QuestionSession.create({
			promotionId: promotion.id,
			questionId: question.id,
			startedAt: new Date(Date.now() - 1000 * 60), // 1 minute ago
			endsAt: new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now
		});
		questionSession.start(); // Make it active
		await questionSessionRepository.save(questionSession);

		const autoGradingListener: IDomainEventListener = {
			handle: vi.fn()
		};
		worker = startRegisterStudentAnswerWorker(
			redisConnection,
			questionSessionRepository,
			autoGradingListener
		);
	});

	afterEach(async () => {
		await answerCommandQueue.close();
	});

	test('When a student submits an answer, it is saved to the database after processing', async () => {
		// --- GIVEN ---
		const answerText = 'This is my answer.';

		// --- WHEN ---
		const job = await acceptAnswerUsecase.execute({
			questionSessionId: questionSession.id.id(),
			studentId: student.id.id(),
			answerText: answerText
		});

		// --- THEN ---
		// 1. Check if the job was enqueued.
		const counts = await answerCommandQueue.getJobCounts('wait', 'active', 'completed');
		console.debug({ counts });
		expect(counts.wait + counts.active + counts.completed).toBe(1);

		// 2. Wait for the worker to process the job
		if (counts.completed === 0) {
			await new Promise((resolve) => {
				const interval = setInterval(async () => {
					const completedCounts = await answerCommandQueue.getJobCounts('completed');
					if (completedCounts.completed > 0) {
						clearInterval(interval);
						resolve(true);
					}
				}, 250);
			});
		}

		// 3. Check the database state
		const updatedSession = await prisma.questionSession.findUnique({
			where: { id: questionSession.id.id() },
			include: { answers: true }
		});

		expect(updatedSession).not.toBeNull();
		expect(updatedSession?.answers).toHaveLength(1);
		expect(updatedSession?.answers[0].studentId).toBe(student.id.id());
		expect(updatedSession?.answers[0].text).toBe(answerText);
	}, 30000);
});
