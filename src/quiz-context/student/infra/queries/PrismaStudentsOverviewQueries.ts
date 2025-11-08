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
				student: true
			}
		});

		return studentsOnPromotions.map((sop) => {
			return {
				id: sop.student.id,
				name: sop.student.name,
				lastname: sop.student.lastName ?? undefined,
				email: sop.student.email ?? undefined
				// joinedAt is not available on this model
			};
		});
	}
}
