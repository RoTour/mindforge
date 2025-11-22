import { UnpublishGradeUsecase } from '$quiz/question-session/application/UnpublishGrade.usecase';
import { PrismaQuestionSessionRepository } from '$quiz/question-session/infra/QuestionSessionRepository/PrismaQuestionSessionRepository';
import { describe, expect, it } from 'vitest';
import { getPrismaTestClient } from '../../../../test/setupIntegration';

describe('UnpublishGradeUsecase Integration Test', () => {
	it('should unpublish a grade', async () => {
		const prisma = getPrismaTestClient();
		const repository = new PrismaQuestionSessionRepository(prisma);
		const usecase = new UnpublishGradeUsecase(repository);
		// Setup: Create a teacher, promotion, question, student, session, and answer
		const teacher = await prisma.teacher.create({
			data: {
				id: 'teacher-unpublish-test',
				authUserId: 'auth-teacher-unpublish-test'
			}
		});

		const promotion = await prisma.promotion.create({
			data: {
				id: 'promo-unpublish-test',
				name: 'Promo Unpublish',
				baseYear: 2024,
				teacherId: teacher.id
			}
		});

		const question = await prisma.question.create({
			data: {
				id: 'q-unpublish-test',
				text: 'Question Unpublish',
				authorId: teacher.id,
				keyNotions: []
			}
		});

		const student = await prisma.student.create({
			data: {
				id: 'student-unpublish-test',
				authUserId: 'auth-student-unpublish-test',
				email: 'student-unpublish@test.com',
				name: 'Student Unpublish'
			}
		});

		const session = await prisma.questionSession.create({
			data: {
				id: 'session-unpublish-test',
				questionId: question.id,
				promotionId: promotion.id,
				startedAt: new Date(),
				endsAt: new Date(Date.now() + 10000),
				status: 'ACTIVE'
			}
		});

		await prisma.answer.create({
			data: {
				id: 'answer-unpublish-test',
				questionSessionId: session.id,
				studentId: student.id,
				text: 'Answer Unpublish',
				submittedAt: new Date(),
				isPublished: true
			}
		});

		// Execute
		await usecase.execute(session.id, student.id);

		// Verify
		const updatedAnswer = await prisma.answer.findUnique({
			where: { id: 'answer-unpublish-test' }
		});

		expect(updatedAnswer?.isPublished).toBe(false);
	});
});
