// src/quiz-context/student/infra/queries/PrismaStudentQueries.ts
import type { PrismaClient } from '$prisma/client';
import type { IStudentQueries } from '../../application/queries/IStudentQueries';

export class PrismaStudentQueries implements IStudentQueries {
	constructor(private readonly client: PrismaClient) {}

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
}
