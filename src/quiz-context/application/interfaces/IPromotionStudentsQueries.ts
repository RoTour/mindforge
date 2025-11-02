import type { PromotionId } from '$quiz/domain/PromotionId.valueObject';
import type { PromotionStudentDTO } from '../dtos/PromotionStudentDTO';

export interface IPromotionStudentsQueries {
	getStudentsFromPromotion(promotionId: PromotionId): Promise<PromotionStudentDTO[]>;
}
