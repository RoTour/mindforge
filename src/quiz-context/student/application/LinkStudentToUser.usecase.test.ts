import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { IStudentRepository } from '../domain/interfaces/IStudentRepository';
import { Student } from '../domain/Student.entity';
import { StudentId } from '../domain/StudentId.valueObject';
import { StudentAlreadyLinkedError, StudentNotFoundError } from './errors';
import { LinkStudentToUserUsecase } from './LinkStudentToUser.usecase';

describe('LinkStudentToUserUsecase', () => {
	let usecase: LinkStudentToUserUsecase;
	let mockStudentRepository: IStudentRepository;

	beforeEach(() => {
		mockStudentRepository = {
			findById: mock(),
			save: mock(),
			saveMany: mock(),
			findStudentByEmail: mock(),
			findAll: mock()
		};
		usecase = new LinkStudentToUserUsecase(mockStudentRepository);
	});

	it('should link student to user successfully and update email', async () => {
		const studentId = new StudentId();
		const student = Student.create({
			id: studentId,
			name: 'John',
			lastName: 'Doe',
			email: 'old-email@example.com'
		});

		(mockStudentRepository.findById as any).mockResolvedValue(student);

		await usecase.execute(studentId.toString(), 'auth-123', 'new-email@example.com');

		expect(student.authId).toBe('auth-123');
		expect(student.email).toBe('new-email@example.com');
		expect(mockStudentRepository.save).toHaveBeenCalledWith(student);
	});

	it('should throw error if student not found', async () => {
		(mockStudentRepository.findById as any).mockResolvedValue(null);

		expect(
			usecase.execute('non-existent-id', 'auth-123', 'email@example.com')
		).rejects.toThrow(StudentNotFoundError);
	});

	it('should throw error if student is already linked to another user', async () => {
		const studentId = new StudentId();
		const student = Student.create({
			id: studentId,
			name: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			authId: 'other-auth-id'
		});

		(mockStudentRepository.findById as any).mockResolvedValue(student);

		expect(
			usecase.execute(studentId.toString(), 'auth-123', 'email@example.com')
		).rejects.toThrow(StudentAlreadyLinkedError);
	});

	it('should not throw if student is already linked to the same user', async () => {
		const studentId = new StudentId();
		const student = Student.create({
			id: studentId,
			name: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			authId: 'auth-123'
		});

		(mockStudentRepository.findById as any).mockResolvedValue(student);

		await usecase.execute(studentId.toString(), 'auth-123', 'john@example.com');

		expect(student.authId).toBe('auth-123');
		expect(mockStudentRepository.save).toHaveBeenCalledWith(student);
	});
});
