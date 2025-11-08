import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';

export type PromotionDetails = {
	name: string;
};

export interface IEnrollQueries {
	getPromotionDetails(promotionId: PromotionId): Promise<PromotionDetails>;
}
