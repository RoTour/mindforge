// @path: src/quiz-context/student/application/TryLinkingStudent.usecase.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TryLinkingStudentUsecase } from './TryLinkingStudent.usecase';
import type { IStudentRepository } from '../domain/interfaces/IStudentRepository';
import type { IStudentVerificationService } from '../domain/interfaces/IStudentVerificationService';
import { Student } from '../domain/Student.entity';
import { StudentId } from '../domain/StudentId.valueObject';

const mockStudentRepository: IStudentRepository = {
	findStudentByEmail: vi.fn(),
	save: vi.fn(),
	findById: vi.fn(),
	findAll: vi.fn(),
	saveMany: vi.fn()
};

const mockStudentVerificationService: IStudentVerificationService = {
	requestVerification: vi.fn(),
	verify: vi.fn()
};

describe('TryLinkingStudentUsecase', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should initiate verification when a student with the given email exists', async () => {
		// Arrange
		const usecase = new TryLinkingStudentUsecase(
			mockStudentRepository,
			mockStudentVerificationService
		);
		const student = Student.create({
			id: new StudentId(),
			email: 'test@example.com',
			name: 'John',
			lastName: 'Doe'
		});
		vi.spyOn(mockStudentRepository, 'findStudentByEmail').mockResolvedValue(student);
		const requestVerificationSpy = vi.spyOn(mockStudentVerificationService, 'requestVerification');

		// Act
		const result = await usecase.execute('test@example.com');

		// Assert
		expect(result.success).toBe(true);
		expect(requestVerificationSpy).toHaveBeenCalledOnce();
	});

	it('should return a failure when no student is found with the given email', async () => {
		// Arrange
		const usecase = new TryLinkingStudentUsecase(
			mockStudentRepository,
			mockStudentVerificationService
		);
		vi.spyOn(mockStudentRepository, 'findStudentByEmail').mockResolvedValue(null);
		const requestVerificationSpy = vi.spyOn(mockStudentVerificationService, 'requestVerification');

		// Act
		const result = await usecase.execute('nonexistent@example.com');

		// Assert
		expect(result.success).toBe(false);
		if (result.success === true) return;
		expect(result.message).toBe('No student found with the provided email.');
		expect(requestVerificationSpy).not.toHaveBeenCalled();
	});

	it('should return a failure when the found student does not have an email', async () => {
		// Arrange
		const usecase = new TryLinkingStudentUsecase(
			mockStudentRepository,
			mockStudentVerificationService
		);
		const student = Student.create({
			id: new StudentId(),
			name: 'John',
			lastName: 'Doe'
		});
		vi.spyOn(mockStudentRepository, 'findStudentByEmail').mockResolvedValue(student);
		const requestVerificationSpy = vi.spyOn(mockStudentVerificationService, 'requestVerification');

		// Act
		const result = await usecase.execute('test@example.com');

		// Assert
		expect(result.success).toBe(false);
		if (result.success === true) return;
		expect(result.message).toBe('Student has no email to verify.');
		expect(requestVerificationSpy).not.toHaveBeenCalled();
	});
});
