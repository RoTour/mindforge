// src/quiz-context/student/infra/queries/PrismaStudentQueries.ts
import type { PrismaClient } from '$prisma/client';
import type { StudentPromotionDto } from '../../application/dtos/StudentPromotionsDto';
import type { IStudentQueries } from '../../application/interfaces/IStudentQueries';
import type { StudentSummaryStatsDto } from '../../application/dtos/StudentSummaryStatsDto';

export class PrismaStudentQueries implements IStudentQueries {
	constructor(private readonly client: PrismaClient) {}
	async getStudentSummaryStats(studentId: string): Promise<StudentSummaryStatsDto> {
		const studentWithPromotions = await this.client.student.findUnique({
			where: { id: studentId },
			include: {
				promotions: {
					include: {
						promotion: {
							include: {
								_count: {
									select: { plannedQuestions: true }
								}
							}
						}
					}
				}
			}
		});

		if (!studentWithPromotions) {
			return {
				nbPromotionsEnrolled: 0,
				nbQuestionsAnswered: 0,
				nbTotalQuestions: 0,
				fullName: 'Anonymous Student'
			};
		}

		const nbPromotionsEnrolled = studentWithPromotions.promotions.length;

		const nbTotalQuestions = studentWithPromotions.promotions.reduce((total, sop) => {
			return total + sop.promotion._count.plannedQuestions;
		}, 0);

		const nbQuestionsAnswered = await this.client.answer.count({
			where: { studentId: studentId }
		});

		const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

		return {
			nbPromotionsEnrolled,
			nbQuestionsAnswered,
			nbTotalQuestions,
			fullName: [
				capitalize(studentWithPromotions.name),
				capitalize(studentWithPromotions.lastName ?? '')
			]
				.join(' ')
				.trim()
		};
	}

	async isStudentInPromotion(authUserId: string, promotionId: string): Promise<boolean> {
		const count = await this.client.studentsOnPromotions.count({
			where: {
				promotionId: promotionId,
				student: {
					authUserId: authUserId
				}
			}
		});

		return count > 0;
	}

	async getStudentIdByAuthUserId(authUserId: string): Promise<string | null> {
		const student = await this.client.student.findUnique({
			where: { authUserId },
			select: { id: true }
		});
		return student?.id ?? null;
	}

	async getStudentPromotions(studentId: string): Promise<StudentPromotionDto[]> {
		const studentWithPromotions = await this.client.student.findUnique({
			where: { id: studentId },
			include: {
				promotions: {
					include: {
						promotion: {
							include: {
								_count: {
									select: { students: true, plannedQuestions: true }
								},
								questionSessions: {
									select: {
										id: true,
										answers: {
											where: {
												studentId: studentId
											},
											select: {
												id: true
											}
										}
									}
								}
							}
						}
					}
				}
			}
		});

		if (!studentWithPromotions) {
			return [];
		}

		const studentPromotions = studentWithPromotions.promotions.map((sop) => {
			const promotion = sop.promotion;

			const completedQuestions = promotion.questionSessions.filter(
				(qs) => qs.answers.length > 0
			).length;

			return {
				id: promotion.id,
				name: promotion.name,
				// TODO: Add description to Promotion model
				description: null,
				progress: {
					completed: completedQuestions,
					total: promotion._count.plannedQuestions
				},
				studentCount: promotion._count.students
			};
		});

		return studentPromotions;
	}
}
