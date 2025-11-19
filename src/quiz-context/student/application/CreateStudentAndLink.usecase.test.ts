import { PromotionNotFoundError } from '$quiz/promotion/application/errors';
import type { IPromotionRepository } from '$quiz/promotion/domain/interfaces/IPromotionRepository';
import { Period } from '$quiz/promotion/domain/Period.valueObject';
import { Promotion } from '$quiz/promotion/domain/Promotion.entity';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';
import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { IStudentRepository } from '../domain/interfaces/IStudentRepository';
import { Student } from '../domain/Student.entity';
import { CreateStudentAndLinkUsecase } from './CreateStudentAndLink.usecase';

describe('CreateStudentAndLinkUsecase', () => {
	let usecase: CreateStudentAndLinkUsecase;
	let mockStudentRepository: IStudentRepository;
	let mockPromotionRepository: IPromotionRepository;

	beforeEach(() => {
		mockStudentRepository = {
			findById: mock(),
			save: mock(),
			saveMany: mock(),
			findStudentByEmail: mock(),
			findAll: mock()
		};
		mockPromotionRepository = {
			findById: mock(),
			save: mock(),
			findAll: mock(),
			findByOwnerId: mock()
		};
		usecase = new CreateStudentAndLinkUsecase(mockStudentRepository, mockPromotionRepository);
	});

	it('should create student and link to promotion', async () => {
		const promotionId = new PromotionId();
		const promotion = Promotion.create({
			id: promotionId,
			name: 'Class A',
			period: new Period(2023),
			teacherId: new TeacherId()
		});

		(mockPromotionRepository.findById as any).mockResolvedValue(promotion);

		await usecase.execute({
			firstName: 'Jane',
			lastName: 'Doe',
			authId: 'auth-456',
			email: 'jane@example.com',
			promotionId: promotionId.toString()
		});

		// Check student creation
		expect(mockStudentRepository.save).toHaveBeenCalled();
		const savedStudent = (mockStudentRepository.save as any).mock.calls[0][0] as Student;
		expect(savedStudent.name).toBe('Jane');
		expect(savedStudent.lastName).toBe('Doe');
		expect(savedStudent.email).toBe('jane@example.com');
		expect(savedStudent.authId).toBe('auth-456');

		// Check promotion linking
		expect(mockPromotionRepository.save).toHaveBeenCalledWith(promotion);
		expect(promotion.studentIds.length).toBe(1);
		expect(promotion.studentIds[0].equals(savedStudent.id)).toBe(true);
	});

	it('should throw error if promotion not found', async () => {
		(mockPromotionRepository.findById as any).mockResolvedValue(null);

		expect(
			usecase.execute({
				firstName: 'Jane',
				lastName: 'Doe',
				authId: 'auth-456',
				email: 'jane@example.com',
				promotionId: 'non-existent-promo'
			})
		).rejects.toThrow(PromotionNotFoundError);
	});
});
