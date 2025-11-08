import { EntityId } from '$lib/ddd/interfaces/EntityId';

export class PromotionId extends EntityId {
	protected generateId(): string {
		const uuid = crypto.randomUUID();
		return `Promotion-${uuid}`;
	}
}
