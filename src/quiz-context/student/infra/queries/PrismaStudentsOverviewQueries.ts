// /src/quiz-context/infra/queries/PrismaStudentsOverviewQueries.ts
import type { PrismaClient } from '$prisma/client';
import type {
	IStudentsOverviewQueries,
	StudentsFromPromotionDTO
} from '../../application/interfaces/IStudentsOverviewQueries';

export class PrismaStudentsOverviewQueries implements IStudentsOverviewQueries {
	constructor(private readonly client: PrismaClient) {}

	async getStudentsFromPromotion(
		promotionId: string,
		teacherId: string
	): Promise<StudentsFromPromotionDTO[]> {
		const studentsOnPromotions = await this.client.studentsOnPromotions.findMany({
			where: {
				promotionId: promotionId,
				promotion: {
					teacherId: teacherId
				}
			},
			include: {
				student: {
					include: {
						answers: {
							where: {
								questionSession: {
									promotionId: promotionId
								}
							},
							select: {
								id: true
							}
						}
					}
				}
			}
		});

		const totalQuestions = await this.client.questionSession.count({
			where: {
				promotionId: promotionId
			}
		});

		const totalPlanned = await this.client.plannedQuestion.count({
			where: {
				promotionId: promotionId
			}
		});

		const total = totalQuestions + totalPlanned;

		const authIds = studentsOnPromotions
			.map((sop) => sop.student.authUserId)
			.filter((id): id is string => !!id);

		const users = await this.client.user.findMany({
			where: {
				id: {
					in: authIds
				}
			},
			select: {
				id: true,
				updatedAt: true
			}
		});

		const userMap = new Map(users.map((u) => [u.id, u.updatedAt]));

		return studentsOnPromotions.map((sop) => {
			const answered = sop.student.answers.length;
			const lastConnection = sop.student.authUserId
				? (userMap.get(sop.student.authUserId) ?? null)
				: null;

			return {
				id: sop.student.id,
				name: sop.student.name,
				lastname: sop.student.lastName ?? undefined,
				email: sop.student.email ?? undefined,
				stats: {
					answered,
					total
				},
				lastConnection
			};
		});
	}
}
