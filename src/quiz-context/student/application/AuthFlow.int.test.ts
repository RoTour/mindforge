import type { PrismaClient } from '$prisma/client';
import { Period } from '$quiz/promotion/domain/Period.valueObject';
import { Promotion } from '$quiz/promotion/domain/Promotion.entity';
import { PrismaPromotionRepository } from '$quiz/promotion/infra/PromotionRepository/PrismaPromotionRepository';
import { Teacher } from '$quiz/teacher/domain/Teacher.entity';
import { PrismaTeacherRepository } from '$quiz/teacher/infra/TeacherRepository/PrismaTeacherRepository';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getPrismaTestClient } from '../../../../test/setupIntegration';
import { Student } from '../domain/Student.entity';
import { StudentId } from '../domain/StudentId.valueObject';
import { PrismaStudentRepository } from '../infra/StudentRepository/PrismaStudentRepository';
import { CreateStudentAndLinkUsecase } from './CreateStudentAndLink.usecase';
import { LinkStudentToUserUsecase } from './LinkStudentToUser.usecase';

describe('Auth Flow Integration Test', () => {
	let prisma: PrismaClient;
	let studentRepository: PrismaStudentRepository;
	let promotionRepository: PrismaPromotionRepository;
	let teacherRepository: PrismaTeacherRepository;
	let linkStudentToUserUsecase: LinkStudentToUserUsecase;
	let createStudentAndLinkUsecase: CreateStudentAndLinkUsecase;

	let teacher: Teacher;
	let promotion: Promotion;

	beforeEach(async () => {
		vi.resetAllMocks();
		prisma = getPrismaTestClient();

		studentRepository = new PrismaStudentRepository(prisma);
		promotionRepository = new PrismaPromotionRepository(prisma);
		teacherRepository = new PrismaTeacherRepository(prisma);

		linkStudentToUserUsecase = new LinkStudentToUserUsecase(studentRepository);
		createStudentAndLinkUsecase = new CreateStudentAndLinkUsecase(
			studentRepository,
			promotionRepository
		);

		// Seed common data
		teacher = Teacher.create({ authUserId: 'teacher-auth-id' });
		await teacherRepository.save(teacher);

		promotion = Promotion.create({
			name: 'Test Class',
			period: new Period(2024),
			teacherId: teacher.id
		});
		await promotionRepository.save(promotion);
	});

	test('Auth flow: When logged user is different from student email, and provided school email is not the one the student has been created with, and student exists in list, should link to student', async () => {
		// GIVEN: An existing unlinked student in the promotion
		const student = Student.create({
			id: new StudentId(),
			name: 'John',
			lastName: 'Doe',
			email: 'original-email@school.com'
		});
		await studentRepository.save(student);
		
		// Add student to promotion manually for setup (or via repository if method exists, but here we manipulate entities)
		// Since Promotion.addStudents updates the promotion entity, we need to save it.
		// However, PrismaPromotionRepository might handle the relation. Let's check.
		// Actually, we should probably use the repository to add the student to the promotion if possible, 
		// or just rely on the fact that the use case links them.
		// Wait, LinkStudentToUser doesn't add to promotion, it assumes student is already there? 
		// The UI shows "unlinked students" from the promotion. So the student must be in the promotion.
		
		promotion.addStudents([student.id]);
		await promotionRepository.save(promotion);

		const userAuthId = 'user-auth-123';
		const userProvidedEmail = 'user-provided@school.com';

		// WHEN: The teacher links the student to the user
		await linkStudentToUserUsecase.execute(student.id.toString(), userAuthId, userProvidedEmail);

		// THEN: The student should be linked and email updated
		const updatedStudent = await studentRepository.findById(student.id.toString());
		expect(updatedStudent).not.toBeNull();
		expect(updatedStudent?.authId).toBe(userAuthId);
		expect(updatedStudent?.email).toBe(userProvidedEmail);
	});

	test('Auth flow: When logged user is different from student email, and provided school email is not the one the student has been created with, and student does not exist in list, should create a new student in promotion', async () => {
		// GIVEN: No student exists yet
		const userAuthId = 'new-user-auth-456';
		const userProvidedEmail = 'new-student@school.com';
		const firstName = 'Jane';
		const lastName = 'Smith';

		// WHEN: The teacher creates and links a new student
		await createStudentAndLinkUsecase.execute({
			firstName,
			lastName,
			authId: userAuthId,
			email: userProvidedEmail,
			promotionId: promotion.id.toString()
		});

		// THEN: A new student should be created with correct details and linked to the promotion
		const students = await studentRepository.findAll();
		const createdStudent = students.find((s) => s.authId === userAuthId);

		expect(createdStudent).toBeDefined();
		expect(createdStudent?.name).toBe(firstName);
		expect(createdStudent?.lastName).toBe(lastName);
		expect(createdStudent?.email).toBe(userProvidedEmail);

		// Verify student is in promotion
		const updatedPromotion = await promotionRepository.findById(promotion.id.toString());
		expect(updatedPromotion?.studentIds.some((id) => id.equals(createdStudent!.id))).toBe(true);
	});
});
