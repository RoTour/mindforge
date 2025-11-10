// /Users/rotour/projects/mindforge/src/quiz-context/promotion/application/PlanQuestion.shared.ts
import { Question } from '$quiz/question/domain/Question.entity';
import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';
import { Teacher } from '$quiz/teacher/domain/Teacher.entity';
import type { ITeacherRepository } from '$quiz/teacher/domain/interfaces/ITeacherRepository';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Period } from '../domain/Period.valueObject';
import { Promotion } from '../domain/Promotion.entity';
import type { IPromotionRepository } from '../domain/interfaces/IPromotionRepository';
import { PlanQuestionUsecase, type PlanQuestionCommand } from './PlanQuestion.usecase';
import type { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';
import type { IDomainEventListener } from '$lib/ddd/interfaces/IDomainEventListener';

export function runPlanQuestionTests(
	suiteName: string,
	context: {
		// The setup function is provided by the caller.
		// It's responsible for creating the correct repository instances.
		setup: () => Promise<{
			promotionRepository: IPromotionRepository;
			questionRepository: IQuestionRepository;
			teacherRepository: ITeacherRepository;
			scheduleSessionListener: IDomainEventListener;
		}>;
	}
) {
	describe(suiteName, () => {
		let usecase: PlanQuestionUsecase;
		let promotionRepository: IPromotionRepository;
		let questionRepository: IQuestionRepository;
		let teacherRepository: ITeacherRepository;

		// Default entities used in all tests
		let defaultTeacher: Teacher;

		let defaultTeacherId: TeacherId;

		let defaultQuestion: Question;

		let defaultPromotion: Promotion;

		// The beforeEach hook now uses the setup function provided by the context.
		beforeEach(async () => {
			vi.resetAllMocks();
			defaultTeacher = Teacher.create({
				authUserId: 'auth-user-1'
			});
			defaultTeacherId = defaultTeacher.id;
			defaultQuestion = Question.create({
				authorId: defaultTeacherId,
				text: 'What are the main goals of TDD ?',
				keyNotions: []
			});
			defaultPromotion = Promotion.create({
				name: 'Promotion 2025',
				period: new Period(2025),
				teacherId: defaultTeacherId
			});
			const repos = await context.setup();
			promotionRepository = repos.promotionRepository;
			questionRepository = repos.questionRepository;
			teacherRepository = repos.teacherRepository;

			// Seed the repositories with default data for each test
			await teacherRepository.save(defaultTeacher);
			await questionRepository.save(defaultQuestion);
			await promotionRepository.save(defaultPromotion);

			usecase = new PlanQuestionUsecase(
				promotionRepository,
				questionRepository,
				repos.scheduleSessionListener
			);
			vi.useFakeTimers();
			vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
		});

		afterEach(() => {
			vi.useRealTimers(); // Mandatory, causes timeout on this test suite if omitted
		});

		// The test cases are exactly the same as before.
		// They are now independent of the repository implementation.
		test('Planned question should be available from promotion', async () => {
			// Arrange
			const command: PlanQuestionCommand = {
				promotionId: defaultPromotion.id.id(),
				questionId: defaultQuestion.id.id(),
				startingOn: new Date(),
				endingOn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // one week later
			};

			// Act
			await usecase.execute(command);

			// Assert
			const promotion = await promotionRepository.findById(command.promotionId);
			expect(promotion).not.toBeNull();
			if (!promotion) return;
			expect(promotion.plannedQuestions).toHaveLength(1);
			expect(promotion.plannedQuestions[0].questionId.id()).toBe(command.questionId);
		});

		test('When planning a question when a first one has already been planed, both should be available', async () => {
			// Arrange
			const secondQuestion = Question.create({
				authorId: defaultTeacher.id,
				text: 'This is the second question'
			});
			await questionRepository.save(secondQuestion);

			const firstCommand: PlanQuestionCommand = {
				promotionId: defaultPromotion.id.id(),
				questionId: defaultQuestion.id.id()
			};
			await usecase.execute(firstCommand);

			const secondCommand: PlanQuestionCommand = {
				promotionId: defaultPromotion.id.id(),
				questionId: secondQuestion.id.id()
			};

			// Act
			await usecase.execute(secondCommand);

			// Assert
			const promotion = await promotionRepository.findById(defaultPromotion.id.id());
			expect(promotion).not.toBeNull();
			if (!promotion) return;

			expect(promotion.plannedQuestions).toHaveLength(2);
			const plannedQuestionIds = promotion.plannedQuestions.map((pq) => pq.questionId.id());
			expect(plannedQuestionIds).toContain(firstCommand.questionId);
			expect(plannedQuestionIds).toContain(secondCommand.questionId);
		});
	});
}
