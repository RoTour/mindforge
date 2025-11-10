import { DomainEventPublisher } from '$lib/ddd/events/DomainEventPublisher';
import type { IPromotionRepository } from '$quiz/promotion/domain/interfaces/IPromotionRepository';
import type { Promotion } from '$quiz/promotion/domain/Promotion.entity';
import { TeacherId } from '$quiz/teacher/domain/TeacherId.valueObject';

export class InMemoryPromotionRepository implements IPromotionRepository {
	private promotions: Map<string, Promotion> = new Map();

	async save(promotion: Promotion): Promise<void> {
		this.promotions.set(promotion.id.id(), promotion);

		// Dispatch events after saving, mimicking the real repository's behavior
		const events = promotion.getDomainEvents();
		events.forEach((event) => DomainEventPublisher.publish(event));
		promotion.clearDomainEvents();
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
