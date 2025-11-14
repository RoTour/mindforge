import { EntityId } from '$lib/ddd/interfaces/EntityId';
import { v7 as randomUUIDv7 } from 'uuid';

export class StudentId extends EntityId {
	protected generateId(): string {
		const uuid = randomUUIDv7();
		return `Student-${uuid}`;
	}
}
