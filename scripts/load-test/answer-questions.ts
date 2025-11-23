import dotenv from 'dotenv';
import Redis from 'ioredis';
import path from 'path';
import { LoadTestServiceProviderFactory } from '../../src/lib/server/LoadTestServiceProvider';
import { startAutoGradeAnswerWorker } from '../../src/quiz-context/question-session/adapters/AutoGradeAnswerWorker.adapter';
import { CreateQuestionSessionUsecase } from '../../src/quiz-context/question-session/application/CreateQuestionSessionUsecase';
import { ScheduleAnswerProcessingOnStudentAnswerSubmitted } from '../../src/quiz-context/question-session/application/listeners/ScheduleAnswerProcessing.listener';
import { RegisterStudentAnswerUsecase } from '../../src/quiz-context/question-session/application/RegisterStudentAnswerUsecase';
import { QuestionSessionId } from '../../src/quiz-context/question-session/domain/QuestionSessionId.valueObject';

// Load environment variables from env.loadtest
const envPath = path.resolve(process.cwd(), 'env.loadtest');
dotenv.config({ path: envPath, override: true });

async function main() {
	const args = process.argv.slice(2);
	const promotionId = args[0];
	let questionSessionId = args[1];

	if (!promotionId) {
		console.error(
			'Usage: bun scripts/load-test/answer-questions.ts <promotionId> [questionSessionId]'
		);
		process.exit(1);
	}

	// Initialize Service Provider
	const env = process.env as any;
	const factory = new LoadTestServiceProviderFactory(env);
	const provider = factory.create();
	const prisma = provider.clients.prisma;

	if (!questionSessionId) {
		console.log('No questionSessionId provided. Auto-generating one...');
		const promotion = await provider.PromotionRepository.findById(promotionId);

		if (!promotion) {
			console.error(`Promotion ${promotionId} not found.`);
			process.exit(1);
		}

		// Find or create a question
		// Using prisma for setup convenience
		let question = await prisma.question.findFirst({
			where: { authorId: promotion.teacherId.id() }
		});

		if (!question) {
			console.log('No question found for this teacher. Creating a test question...');
			question = await prisma.question.create({
				data: {
					text: 'What is the answer to life, the universe, and everything?',
					authorId: promotion.teacherId.id(),
					keyNotions: [{ text: '42' }]
				}
			});
		}

		// Create session using Use Case
		const createQuestionSessionUsecase = new CreateQuestionSessionUsecase(
			provider.QuestionSessionRepository
		);

		const newSessionId = new QuestionSessionId();
		questionSessionId = newSessionId.id();

		await createQuestionSessionUsecase.execute({
			id: questionSessionId,
			promotionId: promotion.id.id(),
			questionId: question.id,
			startedAt: new Date(),
			endsAt: new Date(Date.now() + 3600000) // 1 hour from now
		});

		console.log(`Created QuestionSession: ${questionSessionId}`);
	} else {
		console.log(
			`Simulating answers for promotion ${promotionId} in session ${questionSessionId}...`
		);

		// Verify session exists
		const session = await provider.QuestionSessionRepository.findById(
			new QuestionSessionId(questionSessionId)
		);

		if (!session) {
			console.error(`Session ${questionSessionId} not found.`);
			process.exit(1);
		}

		// Note: We are not checking status here because we want to test the use case behavior,
		// which might throw if session is not active. This is good for testing.
	}

	// Fetch students in promotion using Queries
	const { PromotionId } = await import(
		'../../src/quiz-context/promotion/domain/PromotionId.valueObject'
	);
	const studentsOnPromotion = await provider.PromotionStudentsQueries.getStudentsFromPromotion(
		new PromotionId(promotionId)
	);

	if (studentsOnPromotion.length === 0) {
		console.log('No students found in this promotion.');
		return;
	}

	console.log(`Found ${studentsOnPromotion.length} students.`);

	// Setup Redis connection for worker
	const redisConnection = new Redis({
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT || '6379', 10),
		maxRetriesPerRequest: null
	});

	// Start the worker
	console.log('Starting auto-grade worker with concurrency 5...');
	const worker = startAutoGradeAnswerWorker(
		redisConnection,
		provider.QuestionSessionRepository,
		provider.QuestionRepository,
		provider.services.GradingService,
		5 // concurrency
	);

	const listener = new ScheduleAnswerProcessingOnStudentAnswerSubmitted(provider.MessageQueue);

	const usecase = new RegisterStudentAnswerUsecase(
		provider.QuestionSessionRepository,
		listener
	);

	console.log('Submitting answers...');

	let submittedCount = 0;
	const errors: any[] = [];

	// Run in parallel
	const startTime = Date.now();
	await Promise.all(
		studentsOnPromotion.map(async (student: any) => {
			try {
				await usecase.execute({
					questionSessionId: questionSessionId!,
					studentId: student.id,
					answerText: `Simulated answer from ${student.firstName} at ${new Date().toISOString()}`
				});
				submittedCount++;
			} catch (e) {
				errors.push(e);
			}
		})
	);

	console.log(`Submitted ${submittedCount} answers in ${Date.now() - startTime}ms.`);
	if (errors.length > 0) {
		console.warn(`${errors.length} errors occurred.`);
	}

	console.log('Waiting for auto-grading to complete...');
	// Wait enough time for 10 answers with 1s delay and concurrency 5 -> should take ~2s + overhead
	await new Promise((resolve) => setTimeout(resolve, 5000));

	await worker.close();
	await redisConnection.quit();
	console.log('Done.');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		// Cleanup if needed
	});
