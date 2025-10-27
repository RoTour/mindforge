import type { IPromotionRepository } from '$quiz/domain/interfaces/IPromotionRepository';
import type { Promotion } from '$quiz/domain/Promotion.entity';

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
}
