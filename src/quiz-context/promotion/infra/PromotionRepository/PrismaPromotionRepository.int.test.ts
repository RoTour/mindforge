// /Users/rotour/projects/mindforge/src/quiz-context/infra/PromotionRepository/PrismaPromotionRepository.int.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaPromotionRepository } from './PrismaPromotionRepository';
import { getPrismaTestClient } from '../../../../../test/setupIntegration';
import { Promotion } from '../../domain/Promotion.entity';
import { Period } from '../../domain/Period.valueObject';
import { Student } from '$quiz/student/domain/Student.entity';
import type { PrismaClient } from '$prisma/client';
import { Teacher } from '$quiz/teacher/domain/Teacher.entity';

import { PrismaTeacherRepository } from '$quiz/teacher/infra/TeacherRepository/PrismaTeacherRepository';

describe('PrismaPromotionRepository integration tests', () => {
	let repository: PrismaPromotionRepository;
	let prisma: PrismaClient;
	let teacher: Teacher;

	beforeEach(async () => {
		prisma = getPrismaTestClient();
		// Inject the test prisma client into the repository
		repository = new PrismaPromotionRepository(prisma);
		const teacherRepository = new PrismaTeacherRepository(prisma);
		teacher = Teacher.create({ authUserId: 'test-auth-user' });
		await teacherRepository.save(teacher);
	});

	it('should save a new promotion and its students', async () => {
		// Arrange
		const student1 = Student.create({ name: 'John', lastName: 'Doe' });
		const student2 = Student.create({ name: 'Jane', lastName: 'Doe' });
		await prisma.student.createMany({
			data: [
				{ id: student1.id.id(), name: student1.name, lastName: student1.lastName },
				{ id: student2.id.id(), name: student2.name, lastName: student2.lastName }
			]
		});

		const promotion = Promotion.create({
			name: 'Devs 2025',
			period: new Period(2024),
			teacherId: teacher.id
		});
		promotion.addStudents([student1.id, student2.id]);

		// Act
		await repository.save(promotion);

		// Assert
		const savedPromotion = await prisma.promotion.findUnique({
			where: { id: promotion.id.id() },
			include: { students: true }
		});

		expect(savedPromotion).not.toBeNull();
		expect(savedPromotion?.name).toBe('Devs 2025');
		expect(savedPromotion?.baseYear).toBe(2024);
		expect(savedPromotion?.teacherId).toBe(teacher.id.id());
		expect(savedPromotion?.students.length).toBe(2);
		expect(savedPromotion?.students.map((s) => s.studentId)).toContain(student1.id.id());
		expect(savedPromotion?.students.map((s) => s.studentId)).toContain(student2.id.id());
	});

	it('should find a promotion by its ID', async () => {
		// Arrange
		const student = Student.create({ name: 'Test', lastName: 'User' });
		await prisma.student.create({ data: { id: student.id.id(), name: student.name } });

		const promotion = Promotion.create({
			name: 'Testers 2024',
			period: new Period(2023),
			teacherId: teacher.id
		});
		promotion.addStudents([student.id]);
		await repository.save(promotion);

		// Act
		const foundPromotion = await repository.findById(promotion.id.id());

		// Assert
		expect(foundPromotion).not.toBeNull();
		expect(foundPromotion?.id.id()).toBe(promotion.id.id());
		expect(foundPromotion?.name).toBe('Testers 2024');
		expect(foundPromotion?.period.baseYear).toBe(2023);
		expect(foundPromotion?.teacherId.id()).toBe(teacher.id.id());
		expect(foundPromotion?.studentIds.length).toBe(1);
		expect(foundPromotion?.studentIds[0].id()).toBe(student.id.id());
	});

	it('should return null if promotion is not found by ID', async () => {
		// Act
		const foundPromotion = await repository.findById('non-existent-id');
		// Assert
		expect(foundPromotion).toBeNull();
	});

	it('should find all promotions', async () => {
		// Arrange
		const promotion1 = Promotion.create({
			name: 'Promotion A',
			period: new Period(2022),
			teacherId: teacher.id
		});
		const promotion2 = Promotion.create({
			name: 'Promotion B',
			period: new Period(2023),
			teacherId: teacher.id
		});
		await repository.save(promotion1);
		await repository.save(promotion2);

		// Act
		const allPromotions = await repository.findAll();

		// Assert
		expect(allPromotions.length).toBe(2);
		expect(allPromotions.map((p) => p.name)).toContain('Promotion A');
		expect(allPromotions.map((p) => p.name)).toContain('Promotion B');
	});

	it('should update an existing promotion', async () => {
		// Arrange
		const student1 = Student.create({ name: 'Initial', lastName: 'Student' });
		const student2 = Student.create({ name: 'New', lastName: 'Student' });
		await prisma.student.createMany({
			data: [
				{ id: student1.id.id(), name: student1.name },
				{ id: student2.id.id(), name: student2.name }
			]
		});

		const promotion = Promotion.create({
			name: 'Old Name',
			period: new Period(2020),
			teacherId: teacher.id
		});
		promotion.addStudents([student1.id]);
		await repository.save(promotion);

		// Act: Modify the promotion
		promotion.name = 'New Name';
		promotion.addStudents([student2.id]); // Now contains student1 and student2
		await repository.save(promotion);

		// Assert
		const updatedPromotion = await repository.findById(promotion.id.id());
		expect(updatedPromotion).not.toBeNull();
		expect(updatedPromotion?.name).toBe('New Name');
		expect(updatedPromotion?.studentIds.length).toBe(2);
		expect(updatedPromotion?.studentIds.map((id) => id.id())).toContain(student1.id.id());
		expect(updatedPromotion?.studentIds.map((id) => id.id())).toContain(student2.id.id());
	});

	it('should throw an error when trying to connect to non-existent students', async () => {
		// Arrange
		const nonExistentStudent = Student.create({ name: 'Ghost', lastName: 'Student' });
		const promotion = Promotion.create({
			name: 'Phantom Promotion',
			period: new Period(2024),
			teacherId: teacher.id
		});
		promotion.addStudents([nonExistentStudent.id]);

		// Act & Assert
		// This call is expected to fail because the student record was never created in the database,
		// violating the foreign key constraint.
		await expect(repository.save(promotion)).rejects.toThrow();
	});
});
