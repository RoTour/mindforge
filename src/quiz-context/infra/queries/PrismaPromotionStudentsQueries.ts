import type { IPromotionStudentsQueries } from '$quiz/application/interfaces/IPromotionStudentsQueries';
import { PromotionStudentDTO } from '$quiz/application/dtos/PromotionStudentDTO';
import type { PromotionId } from '$quiz/domain/PromotionId.valueObject';
import type { PrismaClient } from '$prisma/client';

export class PrismaPromotionStudentsQueries implements IPromotionStudentsQueries {
	constructor(private readonly client: PrismaClient) {}
	async getStudentsFromPromotion(promotionId: PromotionId): Promise<PromotionStudentDTO[]> {
		const studentsOnPromotions = await this.client.studentsOnPromotions.findMany({
			where: {
				promotionId: promotionId.id()
			},
			include: {
				student: true
			}
		});

		return studentsOnPromotions.map((sop) => {
			return new PromotionStudentDTO(sop.student.id, sop.student.name, sop.student.lastName ?? '');
		});
	}
}
