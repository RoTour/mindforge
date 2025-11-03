import { PromotionId } from '$quiz/domain/PromotionId.valueObject';
import type { IEnrollQueries } from '../interfaces/IEnrollQueries';

export class EnrollQueries {
	constructor(private readonly queries: IEnrollQueries) {}
	async getPromotionDetails(promotionId: string) {
		const students = await this.queries.getPromotionDetails(new PromotionId(promotionId));
		return students;
	}
}
