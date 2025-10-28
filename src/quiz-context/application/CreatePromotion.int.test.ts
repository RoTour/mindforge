// /Users/rotour/projects/mindforge/src/quiz-context/application/CreatePromotion.int.test.ts
import type { StudentData } from '$quiz/domain/interfaces/IStudentParser';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPromotionRepository } from '../infra/PromotionRepository/InMemoryPromotionRepository';
import { CreatePromotionUsecase } from './CreatePromotion.usecase';
import { BadRequestError } from './errors/BadRequestError';

const studentStubData: StudentData[] = [
	{ name: 'Sarah', lastName: 'Barrabé' },
	{ name: 'Anthony', lastName: 'Cavagné' },
	{ name: 'Robin', lastName: 'Tourné' }
];

describe('CreatePromotionUsecase integration tests', () => {
	let usecase: CreatePromotionUsecase;
	let repository: InMemoryPromotionRepository;

	beforeEach(() => {
		repository = new InMemoryPromotionRepository();
		usecase = new CreatePromotionUsecase(repository);
	});

	it('should create a promotion with a list of students and save it', async () => {
		// Arrange
		const command = {
			name: 'B3 DevOps 2024',
			baseYear: 2024,
			students: studentStubData
		};

		// Act
		await usecase.execute(command);

		// Assert
		const promotions = await repository.findAll();
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
