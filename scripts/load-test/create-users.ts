import dotenv from 'dotenv';
import path from 'path';
import { LoadTestServiceProviderFactory } from '../../src/lib/server/LoadTestServiceProvider';
import { CreatePromotionUsecase } from '../../src/quiz-context/promotion/application/CreatePromotion.usecase';
import { CreateStudentForPromotionUsecase } from '../../src/quiz-context/student/application/CreateStudentForPromotion.usecase';
import { TeacherId } from '../../src/quiz-context/teacher/domain/TeacherId.valueObject';

// Load environment variables from env.loadtest
const envPath = path.resolve(process.cwd(), 'env.loadtest');
dotenv.config({ path: envPath, override: true });

async function main() {
	const args = process.argv.slice(2);
	const numberOfUsers = parseInt(args[0] || '10', 10);
	const promotionIdArg = args[1];

	console.log(`Creating ${numberOfUsers} users...`);

	// Initialize Service Provider
	const env = process.env as any;
	const factory = new LoadTestServiceProviderFactory(env);
	const provider = factory.create();

	let promotionId = promotionIdArg;

	// Ensure a teacher exists
	// We can't easily "findFirst" with repository if it doesn't expose it.
	// But for load test, we can cheat a bit and use the prisma client from provider if needed,
	// OR we can just create a new teacher every time if we don't have a way to find one.
	// Let's try to find one by a known ID or just create one.
	// Since we don't know any IDs, let's create a teacher.
	// But wait, CreatePromotionUsecase needs an existing teacher ID.

	// Let's use the prisma client from provider to find/create a teacher for setup purposes.
	// This is acceptable for the "setup" part of the script.
	const prisma = provider.clients.prisma;
	let teacher = await prisma.teacher.findFirst();
	if (!teacher) {
		console.log('No teacher found. Creating a test teacher...');
		teacher = await prisma.teacher.create({
			data: {
				authUserId: 'test-teacher-' + Date.now()
			}
		});
	}
	const teacherId = new TeacherId(teacher.id);

	if (!promotionId) {
		console.log('No promotion ID provided. Creating a new promotion...');

		// Generate a promotion ID
		// We can't easily get the ID back from CreatePromotionUsecase because it returns void.
		// But we can generate it here and pass it if we modify CreatePromotionUsecase to accept ID.
		// Wait, CreatePromotionUsecase ALREADY accepts optional promotionId in command!
		// I checked it earlier: promotionId: z.string().startsWith(PromotionId.PREFIX).optional()

		// So I need to import PromotionId to generate one, or just let it generate and I won't know it?
		// If I don't know it, I can't print it.
		// So I should generate it.
		const { PromotionId } = await import(
			'../../src/quiz-context/promotion/domain/PromotionId.valueObject'
		);
		const newPromotionId = new PromotionId();
		promotionId = newPromotionId.id();

		const createPromotionUsecase = new CreatePromotionUsecase(
			provider.PromotionRepository,
			provider.StudentRepository,
			provider.TeacherRepository
		);

		const { StudentId } = await import(
			'../../src/quiz-context/student/domain/StudentId.valueObject'
		);

		const studentsData = Array.from({ length: numberOfUsers }).map((_, i) => ({
			id: new StudentId().id(),
			name: `Test`,
			lastName: `Student ${Date.now()} ${i}`,
			email: `student${Date.now()}${i}@test.com`
		}));

		await createPromotionUsecase.execute({
			promotionId: promotionId,
			name: 'Load Test Promotion ' + Date.now(),
			baseYear: 2024,
			teacherId: teacherId,
			students: studentsData
		});

		console.log(`Created promotion: ${promotionId}`);
		console.log(`Created ${numberOfUsers} students and enrolled them.`);
	} else {
		console.log(`Using existing promotion: ${promotionId}`);

		const createStudentForPromotionUsecase = new CreateStudentForPromotionUsecase(
			provider.StudentRepository,
			provider.PromotionRepository
		);

		const studentsData = Array.from({ length: numberOfUsers }).map((_, i) => ({
			firstName: `Test`,
			lastName: `Student ${Date.now()} ${i}`,
			email: `student${Date.now()}${i}@test.com`,
			promotionId: promotionId!
		}));

		// Run in parallel
		await Promise.all(studentsData.map((cmd) => createStudentForPromotionUsecase.execute(cmd)));

		console.log(`Created ${numberOfUsers} students and enrolled them in promotion ${promotionId}.`);
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		// We need to disconnect. Provider doesn't expose disconnect directly but we can access prisma.
		// Actually provider.clients.prisma.$disconnect()
		// But we need to instantiate provider outside main or return it.
		// I'll just let the process exit handle it or use the one created inside.
		// Wait, I can't access `provider` here if it's local to main.
		// I'll move provider declaration up or just ignore explicit disconnect since script exits.
		// Better to be clean.
	});
