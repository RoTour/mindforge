import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';

export type PromotionDetails = {
	id: string;
	name: string;
};

export interface IEnrollQueries {
	getPromotionDetails(promotionId: PromotionId): Promise<PromotionDetails>;
}
