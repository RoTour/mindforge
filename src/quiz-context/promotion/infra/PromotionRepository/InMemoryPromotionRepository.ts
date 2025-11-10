import type { IPromotionRepository } from '$quiz/promotion/domain/interfaces/IPromotionRepository';
import type { Promotion } from '$quiz/promotion/domain/Promotion.entity';
import { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';

export class InMemoryPromotionRepository implements IPromotionRepository {
	private promotions: Map<string, Promotion> = new Map();

	save(promotion: Promotion): Promise<void> {
		this.promotions.set(promotion.id.id(), promotion);
		return Promise.resolve();
	}

	async findById(id: string): Promise<Promotion | null> {
		return this.promotions.get(id) || null;
	}

	async findAll(): Promise<Promotion[]> {
		return Array.from(this.promotions.values());
	}

	async findByOwnerId(teacherId: string): Promise<Promotion[]> {
		const promotions = Array.from(this.promotions.values()).filter((promotion) =>
			promotion.teacherId.equals(new TeacherId(teacherId))
		);
		return promotions;
	}

	clear(): void {
		this.promotions.clear();
	}
}
