import dotenv from 'dotenv';
import path from 'path';
import { LoadTestServiceProviderFactory } from '../../src/lib/server/LoadTestServiceProvider';
import { CreateQuestionSessionUsecase } from '../../src/quiz-context/question-session/application/CreateQuestionSessionUsecase';
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
					keyNotions: { notions: ['42'] }
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

	// Create answers using Use Case
	const registerStudentAnswerUsecase = new RegisterStudentAnswerUsecase(
		provider.QuestionSessionRepository,
		provider.eventListeners.scheduleSessionOnPromotionQuestionPlanned // This listener is not relevant for answering but required by constructor?
		// Wait, RegisterStudentAnswerUsecase constructor signature:
		// constructor(
		// 	private readonly questionSessionRepository: IQuestionSessionRepository,
		// 	private readonly scheduleAutoGradingListener: IDomainEventListener
		// )
		// I need a listener for auto-grading.
		// I should check what listener is used in ServiceProvider.
		// In ServiceProvider.ts it's not explicitly instantiated for this use case in the `services` or `usecases` section,
		// but `RegisterStudentAnswerUsecase` is usually instantiated inside a controller or router.
		// I need to instantiate a listener.
		// `ScheduleAutoGrading` listener?
		// I'll check `src/quiz-context/question-session/application/listeners/ScheduleAutoGrading.listener.ts` if it exists.
		// Or I can pass a dummy listener since I don't care about auto-grading scheduling in this script (or maybe I do?).
		// If I want to test the full flow, I should pass a real listener.
		// But `LoadTestServiceProvider` might not expose it.
		// Let's check `LoadTestServiceProvider.ts` again.
	);

	// I need to instantiate the listener.
	// I'll import `ScheduleAutoGrading` listener.
	// Wait, I don't see it in the file list I saw earlier.
	// I'll assume it exists or I'll use a mock listener.
	// Actually, `RegisterStudentAnswerUsecase` uses it to schedule auto-grading.
	// If I want to avoid side effects or complex setup, I can pass a mock listener that does nothing.
	// Or better, use the real one if possible.

	// Let's try to find the listener first.
	// If not found, I'll create a mock one inline.

	const mockListener = {
		handle: async (event: any) => {
			// console.log('Mock listener handling event:', event);
		}
	};

	const usecase = new RegisterStudentAnswerUsecase(
		provider.QuestionSessionRepository,
		mockListener as any // Cast to IDomainEventListener
	);

	console.log('Submitting answers...');

	let submittedCount = 0;
	const errors: any[] = [];

	// Run in parallel with some concurrency limit if needed, but Promise.all is fine for reasonable numbers
	await Promise.all(
		studentsOnPromotion.map(async (student) => {
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

	console.log(`Submitted ${submittedCount} answers.`);
	if (errors.length > 0) {
		console.warn(`${errors.length} errors occurred.`);
		// console.error(errors[0]);
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		// Cleanup if needed
	});
