// /Users/rotour/projects/mindforge/src/quiz-context/application/CreatePromotion.int.test.ts
import { StudentId } from '$quiz/domain/StudentId.valueObject';
import { InMemoryStudentRepository } from '$quiz/infra/StudentRepository/InMemoryStudentRepository';
import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryPromotionRepository } from '../infra/PromotionRepository/InMemoryPromotionRepository';
import { CreatePromotionUsecase, type CreatePromotionCommand } from './CreatePromotion.usecase';
import type { StudentDTO } from './dtos/StudentDTO';
import { BadRequestError } from './errors/BadRequestError';
import { InMemoryTeacherRepository } from '$quiz/infra/TeacherRepository/InMemoryTeacherRepository';

const studentStubData: StudentDTO[] = [
	{ id: new StudentId().id(), name: 'Sarah', lastName: 'Barrabé' },
	{ id: new StudentId().id(), name: 'Anthony', lastName: 'Cavagné' },
	{ id: new StudentId().id(), name: 'Robin', lastName: 'Tourné' }
];

const authUserId = 'auth-user-id-for-test';

describe('CreatePromotionUsecase integration tests', () => {
	let usecase: CreatePromotionUsecase;
	let promotionRepository: InMemoryPromotionRepository;
	let studentRepository: InMemoryStudentRepository;
	let teacherRepository: InMemoryTeacherRepository;

	beforeEach(() => {
		promotionRepository = new InMemoryPromotionRepository();
		studentRepository = new InMemoryStudentRepository();
		teacherRepository = new InMemoryTeacherRepository();

		usecase = new CreatePromotionUsecase(promotionRepository, studentRepository, teacherRepository);
	});

	it('should create a promotion with a list of students and save it', async () => {
		// Arrange
		const command: CreatePromotionCommand = {
			name: 'B3 DevOps 2024',
			baseYear: 2024,
			students: studentStubData,
			authUserId: authUserId
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

		const teacher = await teacherRepository.findByAuthUserId(authUserId);
		expect(teacher).toBeDefined();
		expect(createdPromotion.teacherId.equals(teacher!.id)).toBe(true);
	});

	it('should throw a BadRequestError if the command is invalid', async () => {
		// Arrange: command with missing name
		const invalidCommand = {
			baseYear: 2024,
			students: studentStubData,
			authUserId: authUserId
		};

		// Act & Assert
		// @ts-expect-error Testing invalid command
		await expect(usecase.execute(invalidCommand)).rejects.toThrowError(BadRequestError);
	});
});
