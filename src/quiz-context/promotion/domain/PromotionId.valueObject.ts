import { EntityId } from '$lib/ddd/interfaces/EntityId';
import { v7 as randomUUIDv7 } from 'uuid';

export class PromotionId extends EntityId {
	public static PREFIX = 'Promotion-';
	protected generateId(): string {
		const uuid = randomUUIDv7();
		return `${PromotionId.PREFIX}${uuid}`;
	}
}
