import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { getPrismaTestClient } from '../../../../../test/setupIntegration';
import { PrismaStudentDashboardQueries } from './PrismaStudentDashboardQueries';

import type { PrismaClient } from '@prisma/client';

describe('PrismaStudentDashboardQueries Integration Test', () => {
	let prisma: PrismaClient;
	let queries: PrismaStudentDashboardQueries;

	const teacherId = 'teacher-dash-' + Date.now();
	const promotionId = 'promo-dash-' + Date.now();
	const studentId = 'student-dash-' + Date.now();
	const questionId1 = 'q1-dash-' + Date.now();
	const questionId2 = 'q2-dash-' + Date.now();
	const sessionId1 = 'session1-dash-' + Date.now();
	const sessionId2 = 'session2-dash-' + Date.now();

	beforeEach(async () => {
		prisma = getPrismaTestClient();
		queries = new PrismaStudentDashboardQueries(prisma);

		await prisma.teacher.create({
			data: { id: teacherId, authUserId: 'auth-' + teacherId }
		});

		await prisma.promotion.create({
			data: { id: promotionId, name: 'Promo Dash', baseYear: 2024, teacherId }
		});

		await prisma.student.create({
			data: { id: studentId, authUserId: 'auth-' + studentId, email: 'student-dash@test.com', name: 'Student Dash' }
		});

		await prisma.question.create({
			data: { id: questionId1, text: 'Q1', authorId: teacherId, keyNotions: [] }
		});

		await prisma.question.create({
			data: { id: questionId2, text: 'Q2', authorId: teacherId, keyNotions: [] }
		});

		await prisma.questionSession.create({
			data: {
				id: sessionId1,
				questionId: questionId1,
				promotionId,
				status: 'CLOSED',
				startedAt: new Date(),
				endsAt: new Date()
			}
		});

		await prisma.questionSession.create({
			data: {
				id: sessionId2,
				questionId: questionId2,
				promotionId,
				status: 'CLOSED',
				startedAt: new Date(),
				endsAt: new Date()
			}
		});

		// Answer 1: Published, with skills
		const answer1 = await prisma.answer.create({
			data: {
				questionSessionId: sessionId1,
				studentId,
				text: 'A1',
				submittedAt: new Date(),
				isPublished: true
			}
		});

		await prisma.grade.create({
			data: {
				skillsMastered: ['Skill A'],
				skillsToReinforce: ['Skill B'],
				comment: 'Good',
				answerAuto: { connect: { id: answer1.id } }
			}
		});

		// Answer 2: Not Published, with skills (should be ignored)
		const answer2 = await prisma.answer.create({
			data: {
				questionSessionId: sessionId2,
				studentId,
				text: 'A2',
				submittedAt: new Date(),
				isPublished: false
			}
		});

		await prisma.grade.create({
			data: {
				skillsMastered: ['Skill C'],
				skillsToReinforce: ['Skill D'],
				comment: 'Pending',
				answerAuto: { connect: { id: answer2.id } }
			}
		});
	});

	afterAll(async () => {
		await prisma.grade.deleteMany();
		await prisma.answer.deleteMany({ where: { studentId } });
		await prisma.questionSession.deleteMany({ where: { promotionId } });
		await prisma.question.deleteMany({ where: { authorId: teacherId } });
		await prisma.student.deleteMany({ where: { id: studentId } });
		await prisma.promotion.deleteMany({ where: { id: promotionId } });
		await prisma.teacher.deleteMany({ where: { id: teacherId } });
	});

	it('should fetch last graded questions (only published)', async () => {
		const questions = await queries.getLastGradedQuestions(studentId, 5);
		expect(questions).toHaveLength(1);
		expect(questions[0].questionText).toBe('Q1');
		expect(questions[0].grade.skillsMastered).toContain('Skill A');
	});

	it('should fetch student skills (only published)', async () => {
		const skills = await queries.getStudentSkills(studentId);
		expect(skills.mastered).toContain('Skill A');
		expect(skills.mastered).not.toContain('Skill C');
		expect(skills.toReinforce).toContain('Skill B');
		expect(skills.toReinforce).not.toContain('Skill D');
	});
});
