import type { PromotionId } from '$quiz/promotion/domain/PromotionId.valueObject';
import type { PromotionStudentDTO } from '$quiz/promotion/application/dtos/PromotionStudentDTO';

export interface IPromotionStudentsQueries {
	getStudentsFromPromotion(promotionId: PromotionId): Promise<PromotionStudentDTO[]>;
}
