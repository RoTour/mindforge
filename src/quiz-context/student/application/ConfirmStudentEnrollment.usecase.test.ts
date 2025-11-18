// @path: src/quiz-context/student/application/ConfirmStudentEnrollment.usecase.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfirmStudentEnrollmentUsecase } from './ConfirmStudentEnrollment.usecase';
import type { IStudentRepository } from '../domain/interfaces/IStudentRepository';
import type { IStudentVerificationService } from '../domain/interfaces/IStudentVerificationService';
import { Student } from '../domain/Student.entity';
import { StudentId } from '../domain/StudentId.valueObject';
import { NotFoundError } from '$quiz/common/application/errors/NotFoundError';

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

describe('ConfirmStudentEnrollmentUsecase', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const usecase = new ConfirmStudentEnrollmentUsecase(
		mockStudentVerificationService,
		mockStudentRepository
	);

	const command = {
		userToLinkEmail: 'test@example.com',
		otp: '123456',
		authId: 'user-auth-id'
	};

	it('should link a student to a user account upon successful verification', async () => {
		// Arrange
		const student = Student.create({
			id: new StudentId(),
			email: 'test@example.com',
			name: 'John',
			lastName: 'Doe'
		});
		vi.spyOn(mockStudentRepository, 'findStudentByEmail').mockResolvedValue(student);
		vi.spyOn(mockStudentVerificationService, 'verify').mockResolvedValue({ success: true });
		const saveSpy = vi.spyOn(mockStudentRepository, 'save');

		// Act
		const result = await usecase.execute(command);

		// Assert
		expect(result.success).toBe(true);
		expect(saveSpy).toHaveBeenCalledOnce();
		const savedStudent = saveSpy.mock.calls[0][0];
		expect(savedStudent.authId).toBe(command.authId);
	});

	it('should fail if the student is not found', async () => {
		// Arrange
		vi.spyOn(mockStudentRepository, 'findStudentByEmail').mockResolvedValue(null);
		const saveSpy = vi.spyOn(mockStudentRepository, 'save');

		// Act & Assert
		await expect(usecase.execute(command)).rejects.toThrow(NotFoundError);
		expect(saveSpy).not.toHaveBeenCalled();
	});

	it('should fail and not link the student if OTP verification is unsuccessful', async () => {
		// Arrange
		const student = Student.create({
			id: new StudentId(),
			email: 'test@example.com',
			name: 'John',
			lastName: 'Doe'
		});
		vi.spyOn(mockStudentRepository, 'findStudentByEmail').mockResolvedValue(student);
		vi.spyOn(mockStudentVerificationService, 'verify').mockResolvedValue({
			success: false,
			error: 'Invalid OTP'
		});
		const saveSpy = vi.spyOn(mockStudentRepository, 'save');

		// Act
		const result = await usecase.execute(command);

		// Assert
		expect(result.success).toBe(false);
		expect(result.error).toBe('Invalid OTP');
		expect(saveSpy).not.toHaveBeenCalled();
	});
});
