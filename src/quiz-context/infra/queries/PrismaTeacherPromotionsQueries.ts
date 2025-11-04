import type { PrismaClient } from '$prisma/client';
import type { ITeacherPromotionsQueries } from '$quiz/application/interfaces/ITeacherPromotionsQueries';
import { Period } from '$quiz/domain/Period.valueObject';
import type { TeacherId } from '$quiz/domain/TeacherId.valueObject';

export class PrismaTeacherPromotionsQueries implements ITeacherPromotionsQueries {
	constructor(private readonly prisma: PrismaClient) {}

	async listTeacherPromotions(teacherId: TeacherId) {
		const promotions = await this.prisma.promotion.findMany({
			where: { teacherId: teacherId.id() },
			select: {
				id: true,
				name: true,
				baseYear: true
			}
		});

		return promotions.map((promotion) => ({
			id: promotion.id,
			name: promotion.name,
			period: new Period(promotion.baseYear)
		}));
	}
}
