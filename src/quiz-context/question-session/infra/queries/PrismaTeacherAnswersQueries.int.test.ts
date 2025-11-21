import { env } from '$env/dynamic/private';
import { createPrismaClient } from '$lib/server/prisma/prisma';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaTeacherAnswersQueries } from './PrismaTeacherAnswersQueries';

describe('PrismaTeacherAnswersQueries Integration Test', () => {
	const prisma = createPrismaClient(env.DATABASE_URL);
	const queries = new PrismaTeacherAnswersQueries(prisma);

	const promotionId = 'test-promotion-id-' + Date.now();
	const studentId = 'test-student-id-' + Date.now();
	const questionId = 'test-question-id-' + Date.now();
	const sessionId = 'test-session-id-' + Date.now();
	const teacherId = 'test-teacher-id-' + Date.now();

	beforeAll(async () => {
		// Setup data
		await prisma.teacher.create({
			data: {
				id: teacherId,
				authUserId: 'auth-' + teacherId
			}
		});

		await prisma.promotion.create({
			data: {
				id: promotionId,
				name: 'Test Promotion',
				baseYear: 2024,
				teacherId: teacherId
			}
		});

		await prisma.student.create({
			data: {
				id: studentId,
				name: 'Test Student',
				email: 'student@test.com'
			}
		});

		await prisma.question.create({
			data: {
				id: questionId,
				text: 'Test Question',
				authorId: teacherId,
				keyNotions: []
			}
		});

		await prisma.questionSession.create({
			data: {
				id: sessionId,
				questionId: questionId,
				promotionId: promotionId,
				startedAt: new Date(),
				endsAt: new Date(Date.now() + 3600000),
				status: 'ACTIVE',
			}
		});

		const answer = await prisma.answer.create({
			data: {
				studentId: studentId,
				questionSessionId: sessionId,
				text: 'Test Answer',
				submittedAt: new Date(),
				isPublished: false
			}
		});

		await prisma.grade.create({
			data: {
				skillsMastered: [],
				skillsToReinforce: [],
				comment: 'Good job',
				answerAuto: {
					connect: {
						id: answer.id
					}
				}
			}
		});
	});

	afterAll(async () => {
		// Cleanup
		await prisma.answer.deleteMany({ where: { questionSessionId: sessionId } });
		await prisma.questionSession.deleteMany({ where: { id: sessionId } });
		await prisma.question.deleteMany({ where: { id: questionId } });
		await prisma.student.deleteMany({ where: { id: studentId } });
		await prisma.promotion.deleteMany({ where: { id: promotionId } });
		await prisma.teacher.deleteMany({ where: { id: teacherId } });
	});

	it('should fetch answers for a promotion', async () => {
		const answers = await queries.getAnswersForPromotion(promotionId);

		expect(answers).toHaveLength(1);
		expect(answers[0].studentId).toBe(studentId);
		expect(answers[0].studentName).toBe('Test Student');
		expect(answers[0].questionId).toBe(questionId);
		expect(answers[0].questionText).toBe('Test Question');
		expect(answers[0].answerText).toBe('Test Answer');
		expect(answers[0].autoGrade).toBeDefined();
		expect(answers[0].autoGrade?.status).toBe('COMPLETED');
	});
});
