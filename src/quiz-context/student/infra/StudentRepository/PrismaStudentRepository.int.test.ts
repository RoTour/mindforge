// /Users/rotour/projects/mindforge/src/quiz-context/infra/StudentRepository/PrismaStudentRepository.int.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaStudentRepository } from './PrismaStudentRepository';
import { getPrismaTestClient } from '../../../../../test/setupIntegration';
import { Student } from '../../domain/Student.entity';
import type { PrismaClient } from '$prisma/client';

describe('PrismaStudentRepository integration tests', () => {
	let repository: PrismaStudentRepository;
	let prisma: PrismaClient;

	beforeEach(() => {
		prisma = getPrismaTestClient();
		repository = new PrismaStudentRepository(prisma);
	});

	it('should save a new student', async () => {
		// Arrange
		const student = Student.create({ name: 'John', lastName: 'Doe', email: 'john.doe@test.com' });

		// Act
		await repository.save(student);

		// Assert
		const savedStudent = await prisma.student.findUnique({ where: { id: student.id.id() } });
		expect(savedStudent).not.toBeNull();
		expect(savedStudent?.name).toBe('John');
		expect(savedStudent?.lastName).toBe('Doe');
		expect(savedStudent?.email).toBe('john.doe@test.com');
	});

	it('should find a student by ID', async () => {
		// Arrange
		const student = Student.create({ name: 'Jane', lastName: 'Doe' });
		await prisma.student.create({
			data: { id: student.id.id(), name: student.name, lastName: student.lastName }
		});

		// Act
		const foundStudent = await repository.findById(student.id.id());

		// Assert
		expect(foundStudent).not.toBeNull();
		expect(foundStudent?.id.id()).toBe(student.id.id());
		expect(foundStudent?.name).toBe('Jane');
	});

	it('should return null if student is not found by ID', async () => {
		// Act
		const foundStudent = await repository.findById('non-existent-id');
		// Assert
		expect(foundStudent).toBeNull();
	});

	it('should find all students', async () => {
		// Arrange
		const student1 = Student.create({ name: 'Alice' });
		const student2 = Student.create({ name: 'Bob' });
		await prisma.student.createMany({
			data: [
				{ id: student1.id.id(), name: student1.name },
				{ id: student2.id.id(), name: student2.name }
			]
		});

		// Act
		const allStudents = await repository.findAll();

		// Assert
		expect(allStudents.length).toBe(2);
		expect(allStudents.map((s) => s.name)).toContain('Alice');
		expect(allStudents.map((s) => s.name)).toContain('Bob');
	});

	it('should update an existing student', async () => {
		// Arrange
		const student = Student.create({ name: 'Initial Name' });
		await repository.save(student);

		// Act
		student.name = 'Updated Name';
		student.email = 'updated@email.com';
		await repository.save(student);

		// Assert
		const updatedStudent = await prisma.student.findUnique({ where: { id: student.id.id() } });
		expect(updatedStudent?.name).toBe('Updated Name');
		expect(updatedStudent?.email).toBe('updated@email.com');
	});

	it('should save multiple students at once', async () => {
		// Arrange
		const students = [
			Student.create({ name: 'Student A' }),
			Student.create({ name: 'Student B' }),
			Student.create({ name: 'Student C' })
		];

		// Act
		await repository.saveMany(students);

		// Assert
		const savedStudents = await prisma.student.findMany();
		expect(savedStudents.length).toBe(3);
		expect(savedStudents.map((s) => s.name)).toContain('Student A');
		expect(savedStudents.map((s) => s.name)).toContain('Student B');
		expect(savedStudents.map((s) => s.name)).toContain('Student C');
	});
});
