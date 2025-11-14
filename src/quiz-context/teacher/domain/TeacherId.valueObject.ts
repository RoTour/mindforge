// /Users/rotour/projects/mindforge/src/quiz-context/domain/TeacherId.valueObject.ts
import { EntityId } from '$lib/ddd/interfaces/EntityId';
import { v7 as randomUUIDv7 } from 'uuid';

export class TeacherId extends EntityId {
	protected generateId(): string {
		const uuid = randomUUIDv7;
		return `Teacher-${uuid}`;
	}
}
