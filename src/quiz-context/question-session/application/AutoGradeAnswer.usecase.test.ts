import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { Question } from '../../question/domain/Question.entity';
import { QuestionId } from '../../question/domain/QuestionId.valueObject';
import { StudentId } from '../../student/domain/StudentId.valueObject';
import { TeacherId } from '../../teacher/domain/TeacherId.valueObject';
import { Answer } from '../domain/Answer.entity';
import { Grade } from '../domain/Grade.valueObject';
import { QuestionSessionId } from '../domain/QuestionSessionId.valueObject';
import { AutoGradeAnswerUsecase } from './AutoGradeAnswer.usecase';
import type { IQuestionSessionRepository } from '../domain/IQuestionSessionRepository';
import type { IQuestionRepository } from '$quiz/question/domain/interfaces/IQuestionRepository';
import type { IGradingService } from '../domain/IGradingService';
import { QuestionSession } from '../domain/QuestionSession.entity';
import { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';

describe('AutoGradeAnswerUsecase', () => {
	let usecase: AutoGradeAnswerUsecase;
	let mockSessionRepo: IQuestionSessionRepository;
	let mockQuestionRepo: IQuestionRepository;
	let mockGradingService: IGradingService;

	beforeEach(() => {
		mockSessionRepo = {
			findById: vi.fn(),
			findActiveByPromotionId: vi.fn(),
			findActiveByPromotionIdForStudent: vi.fn(),
			save: vi.fn()
		};
		mockQuestionRepo = {
			findById: vi.fn(),
			findByAuthorId: vi.fn(),
			save: vi.fn()
		};
		mockGradingService = {
			gradeAnswer: vi.fn()
		};
		usecase = new AutoGradeAnswerUsecase(mockSessionRepo, mockQuestionRepo, mockGradingService);
	});

	it('should attach an auto-grade to the correct answer within the session', async () => {
		// Arrange
		const sessionId = new QuestionSessionId();
		const studentId = new StudentId();
		const questionId = new QuestionId();
		const answerText = 'My answer';

		const question = Question.rehydrate({
			id: questionId,
			text: 'Question text',
			authorId: new TeacherId(),
			keyNotions: []
		});

		const answer = new Answer({
			studentId,
			text: answerText,
			submittedAt: new Date()
		});

		const session = QuestionSession.rehydrate({
			id: sessionId,
			questionId,
			promotionId: new PromotionId(),
			status: 'ACTIVE',
			answers: [answer],
			startedAt: new Date(),
			endsAt: new Date(Date.now() + 10000)
		});

		(mockSessionRepo.findById as Mock).mockResolvedValue(session);
		(mockQuestionRepo.findById as Mock).mockResolvedValue(question);

		const expectedGrade = Grade.create({
			skillsMastered: ['skill1'],
			skillsToReinforce: [],
			comment: 'Good'
		});
		(mockGradingService.gradeAnswer as Mock).mockResolvedValue(expectedGrade);

		// Act
		await usecase.execute({
			questionSessionId: sessionId.id(),
			studentId: studentId.id()
		});

		// Assert
		expect(mockSessionRepo.save).toHaveBeenCalledOnce();
		expect(mockSessionRepo.save).toHaveBeenCalledWith(session);

		const gradedAnswer = session.getAnswerFromStudent(studentId);
		expect(gradedAnswer).toBeDefined();
		expect(gradedAnswer?.autoGrade).toEqual(expectedGrade);
	});
});
