import { PromotionId } from '$quiz/domain/PromotionId.valueObject';
import type { IPromotionStudentsQueries } from '../interfaces/IPromotionStudentsQueries';

export class PromotionStudentsQueries {
	constructor(private readonly queries: IPromotionStudentsQueries) {}
	async getStudentsFromPromotion(promotionId: string) {
		const students = await this.queries.getStudentsFromPromotion(new PromotionId(promotionId));
		return students;
	}
}
