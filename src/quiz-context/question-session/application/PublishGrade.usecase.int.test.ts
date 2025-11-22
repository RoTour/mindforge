import { PrismaQuestionSessionRepository } from '$quiz/question-session/infra/QuestionSessionRepository/PrismaQuestionSessionRepository';
import { describe, expect, it } from 'vitest';
import { getPrismaTestClient } from '../../../../test/setupIntegration';
import { PublishGradeUsecase } from './PublishGrade.usecase';

describe('PublishGradeUsecase Integration Test', () => {
	it('should publish a grade', async () => {
		const prisma = getPrismaTestClient();
		// Setup: Create a question session and an answer
		const teacher = await prisma.teacher.create({
			data: {
				id: 'teacher-1',
				authUserId: 'auth-teacher-1'
			}
		});

		const promotion = await prisma.promotion.create({
			data: {
				id: 'promo-1',
				name: 'Promo 1',
				baseYear: 2024,
				teacherId: teacher.id
			}
		});

		const student = await prisma.student.create({
			data: {
				id: 'student-1',
				authUserId: 'auth-student-1',
				email: 'student@test.com',
				name: 'Student'
			}
		});

		const question = await prisma.question.create({
			data: {
				id: 'q-1',
				text: 'Test Question',
				authorId: teacher.id,
				keyNotions: ['notion1']
			}
		});

		const session = await prisma.questionSession.create({
			data: {
				id: 'session-1',
				questionId: question.id,
				promotionId: promotion.id,
				status: 'ACTIVE',
				startedAt: new Date(),
				endsAt: new Date(Date.now() + 10000)
			}
		});

		await prisma.answer.create({
			data: {
				questionSessionId: session.id,
				studentId: student.id,
				text: 'My Answer',
				submittedAt: new Date(),
				isPublished: false
			}
		});

		// Execute
		const repository = new PrismaQuestionSessionRepository(prisma);
		const useCase = new PublishGradeUsecase(repository);
		await useCase.execute(session.id, student.id);

		// Verify
		const updatedAnswer = await prisma.answer.findUnique({
			where: {
				questionSessionId_studentId: {
					questionSessionId: session.id,
					studentId: student.id
				}
			}
		});

		expect(updatedAnswer?.isPublished).toBe(true);
	});
});
