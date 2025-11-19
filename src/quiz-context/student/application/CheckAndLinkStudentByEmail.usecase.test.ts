import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IStudentRepository } from '../domain/interfaces/IStudentRepository';
import { Student } from '../domain/Student.entity';
import { StudentId } from '../domain/StudentId.valueObject';
import { CheckAndLinkStudentByEmailUsecase } from './CheckAndLinkStudentByEmail.usecase';

describe('CheckAndLinkStudentByEmailUsecase', () => {
	let usecase: CheckAndLinkStudentByEmailUsecase;
	let mockStudentRepository: IStudentRepository;

	beforeEach(() => {
		mockStudentRepository = {
			findById: vi.fn(),
			save: vi.fn(),
			saveMany: vi.fn(),
			findStudentByEmail: vi.fn(),
			findAll: vi.fn()
		};
		usecase = new CheckAndLinkStudentByEmailUsecase(mockStudentRepository);
	});

	it('should return NOT_FOUND if no student exists with the email', async () => {
		(mockStudentRepository.findStudentByEmail as any).mockResolvedValue(null);

		const result = await usecase.execute('unknown@example.com', 'auth-123');

		expect(result).toEqual({ status: 'NOT_FOUND' });
	});

	it('should return ALREADY_LINKED if student exists but is already linked', async () => {
		const student = Student.create({
			id: new StudentId(),
			name: 'John',
			lastName: 'Doe',
			email: 'john@example.com',
			authId: 'existing-auth-id'
		});
		(mockStudentRepository.findStudentByEmail as any).mockResolvedValue(student);

		const result = await usecase.execute('john@example.com', 'auth-123');

		expect(result).toEqual({ status: 'ALREADY_LINKED' });
	});

	it('should link student and return LINKED if student exists and is unlinked', async () => {
		const student = Student.create({
			id: new StudentId(),
			name: 'John',
			lastName: 'Doe',
			email: 'john@example.com'
		});
		(mockStudentRepository.findStudentByEmail as any).mockResolvedValue(student);

		const result = await usecase.execute('john@example.com', 'auth-123');

		expect(result).toEqual({ status: 'LINKED' });
		expect(student.authId).toBe('auth-123');
		expect(mockStudentRepository.save).toHaveBeenCalledWith(student);
	});
});
