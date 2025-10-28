// /Users/rotour/projects/mindforge/src/quiz-context/application/CreatePromotion.int.test.ts
import { StudentId } from '$quiz/domain/StudentId.valueObject';
import { InMemoryStudentRepository } from '$quiz/infra/StudentRepository/InMemoryStudentRepository';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPromotionRepository } from '../infra/PromotionRepository/InMemoryPromotionRepository';
import { CreatePromotionUsecase, type CreatePromotionCommand } from './CreatePromotion.usecase';
import type { StudentDTO } from './dtos/StudentDTO';
import { BadRequestError } from './errors/BadRequestError';

const studentStubData: StudentDTO[] = [
	{ id: new StudentId().id(), name: 'Sarah', lastName: 'Barrabé' },
	{ id: new StudentId().id(), name: 'Anthony', lastName: 'Cavagné' },
	{ id: new StudentId().id(), name: 'Robin', lastName: 'Tourné' }
];

describe('CreatePromotionUsecase integration tests', () => {
	let usecase: CreatePromotionUsecase;
	let promotionRepository: InMemoryPromotionRepository;
	let studentRepository: InMemoryStudentRepository;

	beforeEach(() => {
		promotionRepository = new InMemoryPromotionRepository();
		studentRepository = new InMemoryStudentRepository();
		usecase = new CreatePromotionUsecase(promotionRepository, studentRepository);
	});

	it('should create a promotion with a list of students and save it', async () => {
		// Arrange
		const command: CreatePromotionCommand = {
			name: 'B3 DevOps 2024',
			baseYear: 2024,
			students: studentStubData
		};

		// Act
		await usecase.execute(command);

		// Assert
		const promotions = await promotionRepository.findAll();
		expect(promotions.length).toBe(1);

		const createdPromotion = promotions[0];
		expect(createdPromotion).toBeDefined();
		expect(createdPromotion.name).toBe('B3 DevOps 2024');
		expect(createdPromotion.period.baseYear).toBe(2024);
		expect(createdPromotion.studentIds.length).toBe(studentStubData.length);
	});

	it('should throw a BadRequestError if the command is invalid', async () => {
		// Arrange: command with missing name
		const invalidCommand = {
			baseYear: 2024,
			students: studentStubData
		};

		// Act & Assert
		// @ts-expect-error Testing invalid command
		await expect(usecase.execute(invalidCommand)).rejects.toThrowError(BadRequestError);
	});
});
