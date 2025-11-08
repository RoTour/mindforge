import { EntityId } from '$lib/ddd/interfaces/EntityId';

export class StudentId extends EntityId {
	protected generateId(): string {
		const uuid = crypto.randomUUID();
		return `Student-${uuid}`;
	}
}
