import { PromotionNotFoundError } from '$quiz/promotion/application/errors';
import type { IPromotionRepository } from '$quiz/promotion/domain/interfaces/IPromotionRepository';
import { StudentId } from '$quiz/student/domain/StudentId.valueObject';

export class RemoveStudentFromPromotionUsecase {
	constructor(private promotionRepository: IPromotionRepository) {}

	async execute(promotionId: string, studentId: string): Promise<void> {
		const promotion = await this.promotionRepository.findById(promotionId);
		if (!promotion) {
			throw new PromotionNotFoundError(promotionId);
		}

		promotion.removeStudent(new StudentId(studentId));
		await this.promotionRepository.save(promotion);
	}
}
