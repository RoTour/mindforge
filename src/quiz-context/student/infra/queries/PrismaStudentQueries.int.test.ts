// src/quiz-context/student/infra/queries/PrismaStudentQueries.int.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import type { PrismaClient } from '$prisma/client';
import { getPrismaTestClient } from '../../../../../test/setupIntegration';
import { PrismaStudentQueries } from './PrismaStudentQueries';
import { Student } from '$quiz/student/domain/Student.entity';
import { Promotion } from '$quiz/promotion/domain/Promotion.entity';
import { Period } from '$quiz/promotion/domain/Period.valueObject';
import { Teacher } from '$quiz/teacher/domain/Teacher.entity';
import { Question } from '$quiz/question/domain/Question.entity';

describe('PrismaStudentQueries integration tests', () => {
	let queries: PrismaStudentQueries;
	let prisma: PrismaClient;
	let teacher: Teacher;
	let student: Student;
	let promotion: Promotion;
	let user: { id: string };

	beforeEach(async () => {
		prisma = getPrismaTestClient();
		queries = new PrismaStudentQueries(prisma);

		user = await prisma.user.create({
			data: {
				id: 'student-auth-id',
				email: 'example@test.com',
				name: 'Student User'
			}
		});

		teacher = Teacher.create({ authUserId: 'teacher-auth-id' });
		await prisma.teacher.create({
			data: { id: teacher.id.id(), authUserId: teacher.authUserId }
		});

		student = Student.create({ name: 'John', lastName: 'Doe' });
		await prisma.student.create({
			data: {
				id: student.id.id(),
				name: student.name,
				lastName: student.lastName,
				authUserId: user.id
			}
		});

		promotion = Promotion.create({
			name: 'Test Promotion',
			period: new Period(2025),
			teacherId: teacher.id
		});
		await prisma.promotion.create({
			data: {
				id: promotion.id.id(),
				name: promotion.name,
				baseYear: promotion.period.baseYear,
				teacherId: promotion.teacherId.id()
			}
		});
	});

	describe('getStudentIdByAuthUserId', () => {
		it('should return the student ID for an existing auth user ID', async () => {
			const studentId = await queries.getStudentIdByAuthUserId(user.id);
			expect(studentId).toBe(student.id.id());
		});

		it('should return null for a non-existent auth user ID', async () => {
			const studentId = await queries.getStudentIdByAuthUserId('non-existent-auth-id');
			expect(studentId).toBeNull();
		});
	});

	describe('isStudentInPromotion', () => {
		it('should return true if the student is in the promotion', async () => {
			await prisma.studentsOnPromotions.create({
				data: {
					studentId: student.id.id(),
					promotionId: promotion.id.id()
				}
			});
			const isInPromotion = await queries.isStudentInPromotion(user.id, promotion.id.id());
			expect(isInPromotion).toBe(true);
		});

		it('should return false if the student is not in the promotion', async () => {
			const isInPromotion = await queries.isStudentInPromotion(user.id, promotion.id.id());
			expect(isInPromotion).toBe(false);
		});

		it('should return false for a non-existent auth user ID', async () => {
			const isInPromotion = await queries.isStudentInPromotion(
				'non-existent-auth-id',
				promotion.id.id()
			);
			expect(isInPromotion).toBe(false);
		});

		it('should return false for a non-existent promotion ID', async () => {
			const isInPromotion = await queries.isStudentInPromotion(user.id, 'non-existent-promo-id');
			expect(isInPromotion).toBe(false);
		});
	});

	describe('getStudentPromotions', () => {
		it('should return an empty array if the student is in no promotions', async () => {
			const promotions = await queries.getStudentPromotions(student.id.id());
			expect(promotions).toEqual([]);
		});

		it('should return promotions the student is enrolled in', async () => {
			await prisma.studentsOnPromotions.create({
				data: {
					studentId: student.id.id(),
					promotionId: promotion.id.id()
				}
			});

			const promotions = await queries.getStudentPromotions(student.id.id());

			expect(promotions).toHaveLength(1);
			expect(promotions[0].id).toBe(promotion.id.id());
			expect(promotions[0].name).toBe('Test Promotion');
			expect(promotions[0].description).toBeNull();
			expect(promotions[0].studentCount).toBe(1);
			expect(promotions[0].progress).toEqual({ completed: 0, total: 0 });
		});

		it('should correctly calculate progress based on answered questions', async () => {
			await prisma.studentsOnPromotions.create({
				data: { studentId: student.id.id(), promotionId: promotion.id.id() }
			});

			const q1 = Question.create({ text: 'Example Q1', authorId: teacher.id });
			const q2 = Question.create({ text: 'Example Q2', authorId: teacher.id });
			await prisma.question.createMany({
				data: [
					{ id: q1.id.id(), text: q1.text, authorId: teacher.id.id() },
					{ id: q2.id.id(), text: q2.text, authorId: teacher.id.id() }
				]
			});

			await prisma.plannedQuestion.createMany({
				data: [
					{
						promotionId: promotion.id.id(),
						questionId: q1.id.id(),
						startingOn: new Date(),
						endingOn: new Date()
					},
					{
						promotionId: promotion.id.id(),
						questionId: q2.id.id(),
						startingOn: new Date(),
						endingOn: new Date()
					}
				]
			});

			const qs1 = await prisma.questionSession.create({
				data: {
					promotionId: promotion.id.id(),
					questionId: q1.id.id(),
					startedAt: new Date(Date.now() - 1000 * 60), // 1 minute ago
					endsAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
					status: 'ACTIVE'
				}
			});
			await prisma.questionSession.create({
				data: {
					promotionId: promotion.id.id(),
					questionId: q2.id.id(),
					startedAt: new Date(Date.now() - 1000 * 60), // 1 minute ago
					endsAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
					status: 'ACTIVE'
				}
			});

			await prisma.answer.create({
				data: {
					studentId: student.id.id(),
					questionSessionId: qs1.id,
					text: 'My answer'
				}
			});

			const promotions = await queries.getStudentPromotions(student.id.id());

			expect(promotions).toHaveLength(1);
			expect(promotions[0].progress).toEqual({ completed: 1, total: 2 });
			expect(promotions[0].studentCount).toBe(1);
		});

		it('should handle multiple promotions correctly', async () => {
			const promotion2 = Promotion.create({
				name: 'Second Promotion',
				period: new Period(2026),
				teacherId: teacher.id
			});
			await prisma.promotion.create({
				data: {
					id: promotion2.id.id(),
					name: promotion2.name,
					baseYear: promotion2.period.baseYear,
					teacherId: promotion2.teacherId.id()
				}
			});

			await prisma.studentsOnPromotions.createMany({
				data: [
					{ studentId: student.id.id(), promotionId: promotion.id.id() },
					{ studentId: student.id.id(), promotionId: promotion2.id.id() }
				]
			});

			const promotions = await queries.getStudentPromotions(student.id.id());

			expect(promotions).toHaveLength(2);
			expect(promotions.map((p) => p.name)).toContain('Test Promotion');
			expect(promotions.map((p) => p.name)).toContain('Second Promotion');
		});

		it('should return an empty array for a non-existent student ID', async () => {
			const promotions = await queries.getStudentPromotions('non-existent-student-id');
			expect(promotions).toEqual([]);
		});
	});
});
