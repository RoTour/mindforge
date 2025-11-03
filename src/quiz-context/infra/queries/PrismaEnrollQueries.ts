// /Users/rotour/projects/mindforge/src/quiz-context/infra/queries/PrismaEnrollQueries.ts
import type { IEnrollQueries, PromotionDetails } from '$quiz/application/interfaces/IEnrollQueries';
import type { PrismaClient } from '$prisma/client';
import type { PromotionId } from '$quiz/domain/PromotionId.valueObject';

export class PrismaEnrollQueries implements IEnrollQueries {
	constructor(private readonly client: PrismaClient) {}

	async getPromotionDetails(promotionId: PromotionId): Promise<PromotionDetails> {
		const promotion = await this.client.promotion.findUnique({
			where: {
				id: promotionId.id()
			},
			select: {
				name: true
			}
		});

		if (!promotion) {
			throw new Error('Promotion not found');
		}

		return promotion;
	}
}
